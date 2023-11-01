import express from 'express';
import * as postModel from './db/post.model.js';
import * as userModel from './db/user.model.js';
import * as jwtHelpers from './helpers/jwt.js';
import * as notificationModel from './db/notification.model.js';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadToS3 } from '../config/s3.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const requireAuth = (req, res, next) => {
  const username = jwtHelpers.decrypt(req.cookies.token);
  if (!username) {
    res.status(401).send('Authentication required');
    return;
  }
  req.username = username;
  next();
};

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || 
      file.originalname.toLowerCase().endsWith('.heic') || 
      file.originalname.toLowerCase().endsWith('.heif')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only image files are accepted.'), false);
  }
};

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, 
  }
});

router.get('/', async (req, res) => {
  try {
    const posts = await postModel.getAllPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/user/:username', async (req, res) => {
  try {
    const user = await userModel.findUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userPosts = await postModel.getPostsByUser(user._id);
    res.json(userPosts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const user = await userModel.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).send('User not found');
    }
    
    let imageUrl = null;
    if (req.file) {
      try {
        imageUrl = await uploadToS3(req.file);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    }
    
    const originalPostId = req.body.originalPostId;
    let postData = {
      content: req.body.content || '',
      author: user._id,
      image: imageUrl
    };
    
    if (originalPostId) {
      try {
        const originalPost = await postModel.getPostById(originalPostId);
        
        if (!originalPost) {
          return res.status(404).json({ error: 'Original post not found' });
        }
        
        postData.originalPost = originalPostId;
        postData.isQuoteRetweet = true;
        
        if (originalPost.author && typeof originalPost.author === 'object' && originalPost.author._id) {

          if (originalPost.author._id.toString() !== user._id.toString()) {
            try {
              await notificationModel.createNotification({
                recipient: originalPost.author._id,
                fromUser: user._id,
                type: 'retweet',
                post: originalPostId
              });
            } catch (error) {
              console.error('Failed to create quote retweet notification:', error);
            }
          }
        } else if (originalPost.author && typeof originalPost.author === 'string') {

          try {
            let recipientId;
            
            if (mongoose.Types.ObjectId.isValid(originalPost.author)) {

              recipientId = originalPost.author;
            } else {
    
              const authorUser = await userModel.findUserByUsername(originalPost.author);
              if (!authorUser) {
                throw new Error(`User not found: ${originalPost.author}`);
              }
              recipientId = authorUser._id;
            }
            
            if (recipientId.toString() !== user._id.toString()) {
              await notificationModel.createNotification({
                recipient: recipientId,
                fromUser: user._id,
                type: 'retweet',
                post: originalPostId
              });
            }
          } catch (error) {
            console.error('Failed to create quote retweet notification:', error);
          }
        }
      } catch (error) {
        console.error('Error processing quote retweet:', error);
      }
    }
    
    const post = await postModel.createPost(postData);
    res.json(post);
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:postId', requireAuth, async (req, res) => {
  try {
    const user = await userModel.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const updatedPost = await postModel.updatePost(
      req.params.postId,
      user._id,
      req.body.content
    );
    
    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }
    
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:postId', requireAuth, async (req, res) => {
  try {
    const user = await userModel.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const deletedPost = await postModel.deletePost(
      req.params.postId,
      user._id
    );
    
    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }
    
    res.json({
      message: 'Post deleted successfully',
      postId: req.params.postId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:postId/like', requireAuth, async (req, res) => {
  try {
    const user = await userModel.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const post = await postModel.toggleLike(req.params.postId, user._id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:postId/retweet', requireAuth, async (req, res) => {
  try {
    const user = await userModel.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const result = await postModel.createRetweet(req.params.postId, user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:postId/quote', requireAuth, async (req, res) => {
  try {
    const user = await userModel.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Quote content cannot be empty' });
    }
    
    const postData = {
      content: content,
      author: user._id,
      originalPost: req.params.postId,
      isQuoteRetweet: true
    };
    
    const post = await postModel.createPost(postData);
    
    try {
      const originalPost = await postModel.getPostById(req.params.postId);
      
      if (originalPost && originalPost.author) {
        let recipientId;
        
   
        if (typeof originalPost.author === 'object' && originalPost.author._id) {
   
          recipientId = originalPost.author._id;
        } else if (typeof originalPost.author === 'string') {
       
          if (mongoose.Types.ObjectId.isValid(originalPost.author)) {
       
            recipientId = originalPost.author;
          } else {

            const authorUser = await userModel.findUserByUsername(originalPost.author);
            if (!authorUser) {
              throw new Error(`User not found: ${originalPost.author}`);
            }
            recipientId = authorUser._id;
          }
        }
        
        if (recipientId && recipientId.toString() !== user._id.toString()) {
          await notificationModel.createNotification({
            recipient: recipientId,
            fromUser: user._id,
            type: 'retweet',
            post: req.params.postId
          });
        }
      }
    } catch (error) {
      console.error('Notification error:', error);
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:postId/share', requireAuth, async (req, res) => {
  try {
    const post = await postModel.incrementShareCount(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ success: true, shareCount: post.shareCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:postId/comments', requireAuth, async (req, res) => {
  try {
    const user = await userModel.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }
    
    const post = await postModel.addComment(req.params.postId, user._id, content);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:postId/comments', async (req, res) => {
  try {
    const comments = await postModel.getComments(req.params.postId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:postId/comments/:commentId', requireAuth, async (req, res) => {
  try {
    const user = await userModel.findUserByUsername(req.username);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const result = await postModel.deleteComment(
      req.params.postId,
      req.params.commentId,
      user._id
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:postId/detail', async (req, res) => {
  try {
    const post = await postModel.getPostById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

export default router;