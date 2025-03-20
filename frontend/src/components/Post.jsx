import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, X, Check, Image as ImageIcon, Heart, RefreshCw, Share2, MessageSquare } from 'lucide-react';
import { posts } from '../services/api';

const Post = ({ post, onDelete, onUpdate, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(currentUser?._id));
  const [isRetweeted, setIsRetweeted] = useState(post.retweets?.includes(currentUser?._id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [retweetsCount, setRetweetsCount] = useState(() => getRetweetsCount());
  const [sharesCount, setSharesCount] = useState(post.shareCount || 0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [fullOriginalPost, setFullOriginalPost] = useState(null);

  const [retweetMenuOpen, setRetweetMenuOpen] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [isQuoting, setIsQuoting] = useState(false);
  const isAuthor = currentUser && currentUser.username === post.author;
  const isRetweetAuthor = post.isRetweet && currentUser && currentUser.username === post.author;
  const MAX_CHARS = 280;


  // Fetch full original post data when needed
  useEffect(() => {
    if (post.isQuoteRetweet && post.originalPost && post.originalPost._id) {
      const isIncomplete = !post.originalPost.content || !post.originalPost.image;
      
      if (isIncomplete) {
        const fetchOriginalPost = async () => {
          try {
            const response = await posts.getById(post.originalPost._id);
            setFullOriginalPost(response.data);
          } catch (err) {
            console.error("Failed to fetch original post:", err);
          }
        };
        
        fetchOriginalPost();
      }
    }
  }, [post]);

  // Fetch comments count on initial load
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const response = await posts.getComments(post._id);
        setComments(response.data);
        setCommentsLoaded(true);
      } catch (err) {
        console.error('Failed to fetch comment count:', err);
      }
    };
    
    fetchCommentCount();
  }, [post._id]);

  function getRetweetsCount() {
    return post.isRetweet && post.originalPost 
      ? post.originalPost.retweets?.length || 0 
      : post.retweets?.length || 0;
  }

  useEffect(() => {
    if (showComments && !commentsLoaded) {
      const fetchComments = async () => {
        try {
          const response = await posts.getComments(post._id);
          setComments(response.data);
          setCommentsLoaded(true);
        } catch (err) {
          setError('Failed to load comments');
        }
      };
      
      fetchComments();
    }
  }, [showComments, post._id, commentsLoaded]);

  useEffect(() => {
    setIsLiked(post.likes?.includes(currentUser?._id));
  }, [post.likes, currentUser]);

  useEffect(() => {
    setRetweetsCount(getRetweetsCount());
  }, [post.retweets, post.originalPost]);

  const handleEdit = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      if (!editContent.trim()) {
        setError('Content cannot be empty');
        setIsSubmitting(false);
        return;
      }

      if (editContent.length > MAX_CHARS) {
        setError(`Content exceeds maximum length of ${MAX_CHARS} characters`);
        setIsSubmitting(false);
        return;
      }

      const response = await posts.update(post._id, editContent);

      if (onUpdate) {
        onUpdate(post._id, response.data);
      }
      
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmMessage = post.isRetweet 
      ? 'Are you sure you want to delete this repost?' 
      : 'Are you sure you want to delete this post?';
      
    if (window.confirm(confirmMessage)) {
      try {
        setIsSubmitting(true);
        
        const response = await posts.delete(post._id);

        if (response.data) {
          if (onDelete) {
            onDelete(post._id);
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete post');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(post.content);
      setError('');
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleEdit();
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      alert('Please log in to like posts');
      return;
    }
    
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prevCount => newLikedState ? prevCount + 1 : prevCount - 1);
    
    try {
      const response = await posts.like(post._id);
      
      const serverLikedState = response.data.likes.includes(currentUser._id);
      if (serverLikedState !== newLikedState) {
        setIsLiked(serverLikedState);
        setLikesCount(response.data.likes.length);
      }
    } catch (err) {
      setIsLiked(!newLikedState);
      setLikesCount(prevCount => !newLikedState ? prevCount + 1 : prevCount - 1);
      setError('Failed to like post');
    }
  };

  const handleRetweetClick = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please log in to retweet');
      return;
    }
    
    setRetweetMenuOpen(true);
  };

  const handleRetweet = async () => {
    try {
      setIsRetweeted(!isRetweeted);
      setRetweetsCount(prev => isRetweeted ? prev - 1 : prev + 1);
      setRetweetMenuOpen(false);
      
      const response = await posts.retweet(post._id);
      
      if (response.data.deleted) {
        setIsRetweeted(false);
        setRetweetsCount(Math.max(0, getRetweetsCount() - 1));
      } else {
        setIsRetweeted(true);
        setRetweetsCount(getRetweetsCount() + 1);
      }
    } catch (err) {
      setIsRetweeted(!isRetweeted);
      setRetweetsCount(getRetweetsCount()); 
      setError('Failed to retweet');
    }
  };

  const handleQuoteRetweet = async () => {
    if (!quoteText.trim()) return;
    
    try {
      setIsQuoting(true);
      
      const response = await posts.quoteRetweet(post._id, quoteText);
      
      setQuoteText('');
      setIsQuoting(false);
      setRetweetMenuOpen(false);
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to quote retweet:', error);
      setError('Failed to quote retweet');
      setIsQuoting(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/post/${post._id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.author}`,
          text: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
      
      const response = await posts.share(post._id);
      setSharesCount(response.data.shareCount);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Failed to share post');
      }
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || isAddingComment) return;
    
    if (!currentUser) {
      alert('Please log in to comment');
      return;
    }
    
    setIsAddingComment(true);
    setError('');
    
    try {
      const response = await posts.addComment(post._id, commentText);
      setComments(response.data.comments);
      setCommentText('');
    } catch (err) {
      setError('Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await posts.deleteComment(post._id, commentId);
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      const postDate = new Date(timestamp);
      const now = new Date();
      const diffMs = now - postDate;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffSec < 60) {
        return 'just now';
      } else if (diffMin < 60) {
        return `${diffMin}m ago`;
      } else if (diffHour < 24) {
        return `${diffHour}h ago`;
      } else if (diffDay < 7) {
        return `${diffDay}d ago`;
      } else {
        return postDate.toLocaleDateString();
      }
    } catch (e) {
      return 'some time ago';
    }
  };

  const getAuthor = () => {
    return post.isRetweet && post.originalPost ? post.originalPost.author : post.author;
  };

  const getAuthorAvatar = () => {
    return post.isRetweet && post.originalPost ? post.originalPost.authorAvatar : post.authorAvatar;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all duration-200 hover:shadow-md overflow-hidden animate-fade-in">
      {post.isRetweet && post.originalPost && (
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <RefreshCw size={14} className="mr-2 text-blue-500" />
          <span>Retweeted by <span className="font-medium text-blue-600">{post.author}</span></span>
        </div>
      )}

      {post.isQuoteRetweet && (
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MessageSquare size={14} className="mr-2 text-blue-500" />
          <span>Quote tweet by <span className="font-medium text-blue-600">{post.author}</span></span>
        </div>
      )}

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Link to={`/profile/${getAuthor()}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              {getAuthorAvatar() ? (
                <img 
                  src={getAuthorAvatar()} 
                  alt={getAuthor()} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add("bg-gradient-to-br", "from-blue-400", "to-blue-600");
                    e.target.parentNode.innerHTML = `<span class="text-white font-bold">${getAuthor().charAt(0).toUpperCase()}</span>`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                  {getAuthor().charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </Link>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to={`/profile/${getAuthor()}`}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {getAuthor()}
              </Link>
              <p className="text-sm text-gray-500">
                {formatTimestamp(post.createdAt)}
                {post.updatedAt !== post.createdAt && ' (edited)'}
              </p>
            </div>

            {((isAuthor && !isSubmitting && !post.isRetweet) || (isRetweetAuthor && !isSubmitting)) && (
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Save changes"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(post.content);
                        setError('');
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Cancel editing"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    {!post.isRetweet && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit post"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title={post.isRetweet ? "Delete repost" : "Delete post"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-2">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                rows="3"
                placeholder="What's happening?"
                disabled={isSubmitting}
              />
            ) : (
              <p className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                {post.isRetweet && post.originalPost ? post.originalPost.content : post.content}
              </p>
            )}
          </div>

          {/* Display regular post or retweet image */}
          {((post.isRetweet && post.originalPost && post.originalPost.image) || (!post.isRetweet && !post.isQuoteRetweet && post.image)) && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <div
                className="relative group cursor-pointer"
                onClick={() => setIsImageExpanded(!isImageExpanded)}
              >
                <img
                  src={post.isRetweet && post.originalPost ? post.originalPost.image : post.image}
                  alt="Post attachment"
                  className={`max-w-full rounded-lg border border-gray-100 ${isImageExpanded ? 'w-full' : 'max-h-80 object-cover'}`}
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                  <ImageIcon
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    size={32}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Display quote retweet content and original post */}
          {post.isQuoteRetweet && (post.originalPost || fullOriginalPost) && (
            <div className="mt-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  <Link to={`/profile/${(fullOriginalPost?.author || post.originalPost?.author)}`}>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white font-bold">
                      {(fullOriginalPost?.author || post.originalPost?.author)?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </Link>
                </div>
                
                <div className="flex-1">
                  <Link to={`/profile/${(fullOriginalPost?.author || post.originalPost?.author)}`} className="font-medium text-blue-600">
                    {fullOriginalPost?.author || post.originalPost?.author || "User"}
                  </Link>
                  
                  <p className="text-gray-800 mt-1 text-sm">
                    {fullOriginalPost?.content || post.originalPost?.content || "Original content"}
                  </p>
                </div>
              </div>
              
              {/* Display original post image - Fixed to show complete image */}
              {(fullOriginalPost?.image || post.originalPost?.image) && (
                <div className="mt-2 overflow-hidden rounded-lg">
                  <img 
                    src={fullOriginalPost?.image || post.originalPost?.image} 
                    alt="Original post" 
                    className="w-full object-contain" 
                    style={{maxHeight: "400px"}}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex justify-between">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 p-2 rounded-full hover:bg-red-50 ${isLiked ? 'text-red-500' : 'text-gray-500'} transition-colors`}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{likesCount > 0 ? likesCount : ''}</span>
            </button>
            
            <button
              onClick={handleRetweetClick}
              className="flex items-center space-x-1 p-2 rounded-full hover:bg-green-50 transition-colors"
              aria-label="Retweet options"
            >
              <RefreshCw 
                size={18} 
                className={`${isRetweeted ? 'text-green-500 rotate-90' : 'text-gray-500'} transition-transform`} 
              />
              <span className={isRetweeted ? 'text-green-500' : 'text-gray-500'}>
                {retweetsCount > 0 ? retweetsCount : ''}
              </span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 p-2 rounded-full hover:bg-blue-50 text-gray-500 transition-colors"
              aria-label="Comments"
            >
              <MessageSquare size={18} />
              <span>{commentsLoaded && comments.length > 0 ? comments.length : ''}</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 p-2 rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-colors"
              aria-label="Share"
            >
              <Share2 size={18} />
              <span>{sharesCount > 0 ? sharesCount : ''}</span>
            </button>
          </div>

          {showComments && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="mb-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || isAddingComment}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isAddingComment ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </div>
              
              {comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment._id || comment.id} className="flex space-x-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                        {comment.authorAvatar ? (
                          <img 
                            src={comment.authorAvatar} 
                            alt={comment.author}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentNode.classList.add("bg-blue-600");
                              e.target.parentNode.innerHTML = `<span class="text-white font-bold">${comment.author.charAt(0).toUpperCase()}</span>`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            {comment.author.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="font-medium text-blue-900">{comment.author}</span>
                            <span className="ml-2 text-xs text-gray-500">{formatTimestamp(comment.createdAt)}</span>
                          </div>
                 
                          {(currentUser?.username === comment.author || currentUser?.username === post.author) && (
                            <button
                              onClick={() => handleDeleteComment(comment._id || comment.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm">{comment.content || comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center">No comments yet. Be the first to comment!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded-md animate-fade-in">
          {error}
        </div>
      )}

      {isEditing && (
        <div className="mt-2 text-xs text-gray-500">
          Press Esc to cancel • Ctrl+Enter to save
        </div>
      )}

      {isSubmitting && (
        <div className="mt-2 text-sm text-gray-500 animate-pulse">
          Processing...
        </div>
      )}

      {retweetMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-xl max-w-xs w-full">
            <h3 className="text-lg font-semibold mb-3">Retweet options</h3>
            
            <button
              onClick={handleRetweet}
              className="w-full text-left px-4 py-3 mb-2 hover:bg-gray-100 rounded-md flex items-center"
            >
              <RefreshCw size={18} className="mr-3 text-green-500" />
              {post.isRetweet && currentUser.username === post.author 
                ? 'Undo Repost' 
                : (isRetweeted ? 'Undo Repost' : 'Repost')}
            </button>
            
            <button
              onClick={() => {
                setIsQuoting(true);
                setRetweetMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-md flex items-center"
            >
              <MessageSquare size={18} className="mr-3 text-blue-500" />
              Quote
            </button>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setRetweetMenuOpen(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isQuoting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h3 className="font-bold text-lg mb-3">Quote Repost</h3>
            
            <div className="mb-3 p-3 bg-gray-50 rounded border text-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white">
                    {post.author.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <strong>{post.author}</strong>
                  <p>{post.content.substring(0, 120)}{post.content.length > 120 ? '...' : ''}</p>
                  
                  {/* Display image in quote dialog if available */}
                  {post.image && (
                    <div className="mt-2">
                      <img 
                        src={post.image} 
                        alt="Post attachment" 
                        className="max-h-32 rounded object-cover" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <textarea
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Add a comment..."
            ></textarea>
            
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => setIsQuoting(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleQuoteRetweet}
                disabled={!quoteText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Repost
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;