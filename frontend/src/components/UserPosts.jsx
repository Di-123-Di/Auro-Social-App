import React, { useState, useEffect } from 'react';
import { posts } from '../services/api';
import Post from './Post';

const UserPosts = ({ username }) => {
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const response = await posts.getUserPosts(username);
        setUserPosts(response.data);
      } catch (error) {
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserPosts();
   } else {
      setLoading(false); 
   }

}, [username]);

  const handlePostDelete = (postId) => {
    setUserPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
  };

  const handlePostUpdate = (postId, updatedPost) => {
    setUserPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId ? updatedPost : post
      )
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center p-4">
      <div className="text-gray-500">Loading posts...</div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 p-4 text-center">
      {error}
    </div>
  );

  if (userPosts.length === 0) return (
    <div className="text-gray-500 p-4 text-center">
      No posts yet.
    </div>
  );

  return (
    <div className="space-y-4">
      {userPosts.map(post => (
        <Post
          key={post._id}
          post={post}
          currentUser={currentUser}
          onDelete={handlePostDelete}
          onUpdate={handlePostUpdate}
        />
      ))}
    </div>
  );
};

export default UserPosts;