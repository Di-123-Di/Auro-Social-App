import mongoose from "mongoose";
import { PostSchema } from './post.schema.js';
import * as notificationModel from './notification.model.js';

const PostModel = mongoose.model("Post", PostSchema);

export async function createPost(postData) {
  const post = await PostModel.create({
    content: postData.content.toString(),
    author: postData.author,
    image: postData.image,
    originalPost: postData.originalPost || null,
    isRetweet: postData.isRetweet || false,
    isQuoteRetweet: postData.isQuoteRetweet || false
  });
  
  return PostModel.findById(post._id)
    .populate('author', 'username avatar')
    .populate({
      path: 'originalPost',
      populate: {
        path: 'author',
        select: 'username avatar'
      }
    })
    .lean()
    .then(populatedPost => ({
      _id: populatedPost._id,
      content: populatedPost.content,
      author: populatedPost.author.username,
      authorAvatar: populatedPost.author.avatar,
      image: populatedPost.image,
      createdAt: populatedPost.createdAt,
      updatedAt: populatedPost.updatedAt,
      likes: populatedPost.likes || [],
      retweets: populatedPost.retweets || [],
      shareCount: populatedPost.shareCount || 0,
      isRetweet: populatedPost.isRetweet || false,
      isQuoteRetweet: populatedPost.isQuoteRetweet || false,
      originalPost: populatedPost.originalPost ? {
        _id: populatedPost.originalPost._id,
        content: populatedPost.originalPost.content,
        author: populatedPost.originalPost.author.username,
        authorAvatar: populatedPost.originalPost.author.avatar,
        image: populatedPost.originalPost.image,
        createdAt: populatedPost.originalPost.createdAt,
        likes: populatedPost.originalPost.likes || []
      } : null
    }));
}

export function getAllPosts() {
  return PostModel.find()
    .sort({ createdAt: -1 })
    .populate('author', 'username avatar')
    .populate({
      path: 'originalPost',
      populate: {
        path: 'author',
        select: 'username avatar'
      }
    })
    .populate('comments.author', 'username avatar')
    .transform(documents => {
      return documents.map(doc => ({
        ...doc.toObject(),
        author: doc.author.username,
        authorAvatar: doc.author.avatar,
        originalPost: doc.originalPost ? {
          ...doc.originalPost.toObject(),
          author: doc.originalPost.author.username,
          authorAvatar: doc.originalPost.author.avatar
        } : null,
        comments: doc.comments ? doc.comments.map(comment => ({
          ...comment,
          author: comment.author.username,
          authorAvatar: comment.author.avatar
        })) : []
      }));
    })
    .exec();
}

export async function getPostsByUser(userId) {
  return PostModel.find({ author: userId })
    .sort({ createdAt: -1 })
    .populate('author', 'username avatar') 
    .populate({
      path: 'originalPost',
      populate: {
        path: 'author',
        select: 'username avatar' 
      }
    })
    .populate('comments.author', 'username avatar')
    .transform(documents => {
      return documents.map(doc => ({
        ...doc.toObject(),
        author: doc.author.username,
        authorAvatar: doc.author.avatar, 
        originalPost: doc.originalPost ? {
          ...doc.originalPost.toObject(),
          author: doc.originalPost.author.username,
          authorAvatar: doc.originalPost.author.avatar 
        } : null,
        comments: doc.comments ? doc.comments.map(comment => ({
          ...comment,
          author: comment.author.username,
          authorAvatar: comment.author.avatar 
        })) : []
      }));
    });
}

export async function updatePost(postId, userId, content) {

  const updatedPost = await PostModel.findOneAndUpdate(
    {
      _id: postId,
      author: userId
    },
    {
      content: content,
      updatedAt: Date.now()
    },
    {
      new: true
    }
  ).populate('author', 'username avatar').lean();  
  

  if (updatedPost) {
    return {
      ...updatedPost,
      author: updatedPost.author.username,
      authorAvatar: updatedPost.author.avatar
    };
  }
  
  return null;
}

export async function deletePost(postId, userId) {
  return PostModel.findOneAndDelete({
    _id: postId,
    author: userId
  }).exec();
}

export async function toggleLike(postId, userId) {
  const post = await PostModel.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }
  
  const userLikedIndex = post.likes.findIndex(id => id.toString() === userId.toString());
  if (userLikedIndex > -1) {
    post.likes.splice(userLikedIndex, 1);
  } else {
    post.likes.push(userId);
    
    if (post.author.toString() !== userId.toString()) {
      try {
        await notificationModel.createNotification({
          recipient: post.author,
          fromUser: userId,
          type: 'like',
          post: postId
        });
      } catch (error) {

      }
    }
  }
  
  await post.save();
  return PostModel.findById(postId)
    .populate('author', 'username')
    .lean()
    .then(populatedPost => ({
      ...populatedPost,
      author: populatedPost.author.username
    }));
}

export async function createRetweet(originalPostId, userId) {
  const originalPost = await PostModel.findById(originalPostId);
  if (!originalPost) {
    throw new Error('Original post not found');
  }

  const existingRetweet = await PostModel.findOne({
    author: userId,
    originalPost: originalPostId,
    isRetweet: true
  });
  
  if (existingRetweet) {
    await PostModel.findByIdAndDelete(existingRetweet._id);
    
    originalPost.retweets = originalPost.retweets.filter(
      id => id.toString() !== userId.toString()
    );
    await originalPost.save();
    
    return { deleted: true, postId: existingRetweet._id };
  }

  const newPost = await PostModel.create({
    author: userId,
    originalPost: originalPostId,
    isRetweet: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  originalPost.retweets.push(userId);
  await originalPost.save();

  if (originalPost.author.toString() !== userId.toString()) {
    try {
      await notificationModel.createNotification({
        recipient: originalPost.author,
        fromUser: userId,
        type: 'retweet',
        post: originalPostId
      });
    } catch (error) {
    }
  }
  
  return PostModel.findById(newPost._id)
    .populate('author', 'username')
    .populate({
      path: 'originalPost',
      populate: {
        path: 'author',
        select: 'username'
      }
    })
    .lean()
    .then(populatedPost => ({
      ...populatedPost,
      author: populatedPost.author.username,
      originalPost: {
        ...populatedPost.originalPost,
        author: populatedPost.originalPost.author.username
      }
    }));
}

export async function createQuoteRetweet(originalPostId, userId, content) {
  const originalPost = await PostModel.findById(originalPostId);
  if (!originalPost) {
    throw new Error('Original post not found');
  }

  const newPost = await PostModel.create({
    content: content,
    author: userId,
    originalPost: originalPostId,
    isQuoteRetweet: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  if (originalPost.author.toString() !== userId.toString()) {
    try {
      await notificationModel.createNotification({
        recipient: originalPost.author,
        fromUser: userId,
        type: 'retweet',
        post: originalPostId
      });
    } catch (error) {

    }
  }
  
  return PostModel.findById(newPost._id)
    .populate('author', 'username avatar')
    .populate({
      path: 'originalPost',
      populate: {
        path: 'author',
        select: 'username avatar'
      }
    })
    .lean()
    .then(populatedPost => ({
      ...populatedPost,
      author: populatedPost.author.username,
      authorAvatar: populatedPost.author.avatar,
      originalPost: {
        ...populatedPost.originalPost,
        author: populatedPost.originalPost.author.username,
        authorAvatar: populatedPost.originalPost.author.avatar
      }
    }));
}

export async function incrementShareCount(postId) {
  return PostModel.findByIdAndUpdate(
    postId,
    { $inc: { shareCount: 1 } },
    { new: true }
  ).exec();
}

export async function addComment(postId, userId, content) {
  const post = await PostModel.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }
  
  post.comments.push({
    content: content,
    author: userId
  });

  if (post.author.toString() !== userId.toString()) {
    try {
      await notificationModel.createNotification({
        recipient: post.author,
        fromUser: userId,
        type: 'comment',
        post: postId
      });
    } catch (error) {

    }
  }
  
  await post.save();
  return PostModel.findById(postId)
    .populate('author', 'username')
    .populate('comments.author', 'username avatar')
    .lean()
    .then(populatedPost => ({
      ...populatedPost,
      author: populatedPost.author.username,
      comments: populatedPost.comments.map(comment => ({
        ...comment,
        author: comment.author.username,
        authorAvatar: comment.author.avatar
      }))
    }));
}

export async function getComments(postId) {
  const post = await PostModel.findById(postId)
    .populate('comments.author', 'username avatar')
    .lean();
  
  if (!post) {
    throw new Error('Post not found');
  }
  
  return post.comments.map(comment => ({
    ...comment,
    author: comment.author.username,
    authorAvatar: comment.author.avatar
  }));
}

export async function deleteComment(postId, commentId, userId) {
  const post = await PostModel.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }
  
  const comment = post.comments.id(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.author.toString() !== userId.toString() &&
      post.author.toString() !== userId.toString()) {
    throw new Error('Unauthorized to delete this comment');
  }

  post.comments.pull({ _id: commentId });
  await post.save();
  
  return { success: true, message: 'Comment deleted successfully' };
}

export async function getPostById(postId) {
  return PostModel.findById(postId)
    .populate('author', 'username avatar')
    .populate({
      path: 'originalPost',
      populate: {
        path: 'author',
        select: 'username avatar'
      }
    })
    .populate('comments.author', 'username avatar')
    .lean()
    .then(doc => {
      if (!doc) return null;
      
      return {
        ...doc,
        author: doc.author.username,
        authorAvatar: doc.author.avatar,
        originalPost: doc.originalPost ? {
          ...doc.originalPost,
          author: doc.originalPost.author.username,
          authorAvatar: doc.originalPost.author.avatar
        } : null,
        comments: doc.comments ? doc.comments.map(comment => ({
          ...comment,
          author: comment.author.username,
          authorAvatar: comment.author.avatar
        })) : []
      };
    });
}