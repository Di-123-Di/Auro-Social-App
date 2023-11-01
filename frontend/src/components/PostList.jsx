import React, { useState, useEffect } from 'react';
import { posts } from '../services/api';
import Post from './Post';
import CreatePost from './CreatePost';

const PostList = () => {
  const [postList, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await posts.getAll();
      setPosts(response.data);
    } catch (error) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (postId, updatedPost) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === postId ? updatedPost : post
      )
    );
  };

  const handlePostDelete = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
  };

  const handleNewPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setShowCreatePost(false); 
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
  {currentUser && !showCreatePost && (
  <button
    onClick={() => setShowCreatePost(true)}
    className="w-full p-6 mb-6 text-left bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-purple-100 flex items-center space-x-4"
  >
    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
      <span className="text-purple-600 font-bold">
        {currentUser.username[0].toUpperCase()}
      </span>
    </div>
    <span className="text-gray-500 text-lg">
      What's happening, {currentUser.username}?
    </span>
  </button>
)}

      {showCreatePost && (
        <div className="mb-6">
          <CreatePost 
            onPostCreated={handleNewPost}
            onCancel={() => setShowCreatePost(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {postList.map(post => (
          <Post
            key={post._id}
            post={post}
            currentUser={currentUser}
            onDelete={handlePostDelete}
            onUpdate={handlePostUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default PostList;