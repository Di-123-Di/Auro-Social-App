import React, { useState, useEffect } from 'react';
import { posts } from '../services/api';
import { Image, X, Loader } from 'lucide-react';

const CreatePost = ({ onPostCreated, onCancel, user }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 280;

 
  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      const response = await posts.create(formData);
      
   
      setContent('');
      setImage(null);
      setPreviewUrl(null);
      setCharCount(0);
      
   
      if (onPostCreated) {
        onPostCreated(response.data);
      }
      
   
      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data ||
        'Failed to create post. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { 
        setError("Image size should be less than 10MB");
        return;
      }
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.username.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="flex-grow relative">
            <textarea
              value={content}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setContent(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="What's happening?"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              rows="3"
              disabled={isSubmitting}
            />
            <div className={`absolute bottom-2 right-2 text-xs ${charCount > MAX_CHARS * 0.8 ? (charCount >= MAX_CHARS ? 'text-red-500' : 'text-yellow-500') : 'text-gray-400'}`}>
              {charCount}/{MAX_CHARS}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isSubmitting}
            />
            <label
              htmlFor="image-upload"
              className={`flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Image size={18} className="text-blue-500" />
              <span>Image</span>
            </label>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
          </div>
          
          <button
            type="submit"
            disabled={(!content.trim() && !image) || isSubmitting || charCount > MAX_CHARS}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-1">
                <Loader size={16} className="animate-spin" />
                <span>Posting</span>
              </div>
            ) : (
              'Post'
            )}
          </button>
        </div>
        
        {previewUrl && (
          <div className="mt-2 relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-1">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full rounded-lg max-h-80 mx-auto object-contain"
            />
            <button
              type="button"
              onClick={() => {
                setImage(null);
                setPreviewUrl(null);
              }}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
              aria-label="Remove image"
              disabled={isSubmitting}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm animate-fade-in">
            {error}
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-2">
          Tip: Press Ctrl+Enter to post quickly
        </div>
      </form>
    </div>
  );
};

export default CreatePost;