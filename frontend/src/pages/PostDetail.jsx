import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { posts } from '../services/api';
import Post from '../components/Post';
import { ArrowLeft } from 'lucide-react';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await posts.getById(postId);
        setPost(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Failed to load post. It may have been deleted or is unavailable.');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handlePostDelete = () => {
   
    navigate('/');
  };

  const handlePostUpdate = (id, updatedPost) => {
  
    if (id === post._id) {
      setPost(updatedPost);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-500 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back
        </button>
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
          <p>{error || "This post doesn't exist or has been deleted."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-blue-500 hover:text-blue-700 mb-6"
      >
        <ArrowLeft size={18} className="mr-1" />
        Back
      </button>
      
      <div className="mb-4">
        <Post
          post={post}
          currentUser={currentUser}
          onDelete={handlePostDelete}
          onUpdate={handlePostUpdate}
        />
      </div>
      

    </div>
  );
};

export default PostDetail;