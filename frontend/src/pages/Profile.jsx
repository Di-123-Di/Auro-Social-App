import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Edit2, Check, X, Mail, Camera } from 'lucide-react';
import axios from 'axios';
import UserPosts from '../components/UserPosts';
import { auth } from '../services/api';

const Profile = ({ user, onUserUpdate }) => {
  const { username } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${username}`);
        setUserData(response.data);
        setStatus(response.data.status || '');
        setError(null);
      } catch (error) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  const handleSave = async () => {
    try {
      await axios.put('/api/users/status', { status }, {
        withCredentials: true
      });
      setIsEditing(false);
      setUserData(prev => ({
        ...prev,
        status: status
      }));
     
      setSuccessMessage('Status updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to update status');
    }
  };

  const handleSendEmailVerification = async () => {
    try {
      setVerificationLoading(true);
      await auth.sendEmailVerification();
      setVerificationType('email');
      setVerificationSent(true);
      setShowVerificationModal(true);
      setVerificationError('');
    } catch (error) {
      setVerificationError('Failed to send verification code');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setVerificationLoading(true);
      
      if (verificationType === 'email') {
        await auth.verifyEmail(verificationCode);
      }
      
      const response = await axios.get(`/api/users/${username}`);
      setUserData(response.data);
      
      setShowVerificationModal(false);
      setVerificationCode('');
      setVerificationError('');

      setSuccessMessage('Email verified successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setVerificationError('Verification failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      setVerificationLoading(true);
      await auth.updateEmail(newEmail);
      
      const response = await axios.get(`/api/users/${username}`);
      setUserData(response.data);
      
      setShowEmailModal(false);
      setNewEmail('');
      setVerificationError('');
   
      setSuccessMessage('Email updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setVerificationError('Failed to update email');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Avatar size should be less than 5MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
    
      const response = await axios.post('/api/users/avatar', formData, {
        withCredentials: true
      });
    
      if (response.data && response.data.avatar) {
    
        setUserData({
          ...userData,
          avatar: response.data.avatar
        });
        
     
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser && currentUser.username === username) {
          const updatedUser = {
            ...currentUser,
            avatar: response.data.avatar
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
       
          if (onUserUpdate) {
            onUserUpdate(updatedUser);
          }
        }
      
 
        setAvatarFile(null);
        setAvatarPreview(null);
        setError(null);
        
  
        setSuccessMessage('Avatar updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        
 
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
 
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm animate-fade-in">
          {successMessage}
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-400" />
        
        <div className="px-6 pb-6 -mt-8">
          <div className="mb-4">
            {user?.username === username ? (
              <div className="relative w-24 h-24 cursor-pointer group">
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                />
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute inset-0 z-10 flex items-center justify-center"
                >
                  <div className="rounded-full overflow-hidden border-4 border-white shadow-md w-full h-full">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : userData?.avatar ? (
                      <img src={userData.avatar} alt={username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center w-full h-full text-white">
                        <span className="text-3xl">{username?.[0]?.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 rounded-full flex items-center justify-center transition-opacity">
                    <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </label>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                {userData?.avatar ? (
                  <img src={userData.avatar} alt={username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{username?.[0]?.toUpperCase()}</span>
                )}
              </div>
            )}
            
            {avatarPreview && (
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUploadingAvatar ? 'Uploading...' : 'Save Avatar'}
                </button>
                <button
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-1">{username}</h1>
              {userData?.joinedAt && (
                <p className="text-gray-500 text-sm">
                  Joined {new Date(userData.joinedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            
            {user?.username === username && (
              <div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Edit2 size={20} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-3">About</h2>
            {isEditing ? (
              <textarea
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 border border-blue-200 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Write something about yourself..."
              />
            ) : (
              <div className="bg-blue-50 rounded-lg p-4 text-gray-700">
                {status ? (
                  <p className="whitespace-pre-wrap">{status}</p>
                ) : (
                  <p className="text-gray-500 italic">No bio yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {user?.username === username && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-4">Account Settings</h2>

          <div className="mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-md font-medium">Email</h3>
                <p className="text-sm text-gray-500">
                  {userData?.email ? (
                    <>
                      {userData.email}
                      {userData.emailVerified ? (
                        <span className="ml-2 text-green-500">(Verified)</span>
                      ) : (
                        <span className="ml-2 text-orange-500">(Not Verified)</span>
                      )}
                    </>
                  ) : (
                    'No email added'
                  )}
                </p>
              </div>
              <button
                className="px-3 py-1 border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50"
                onClick={() => setShowEmailModal(true)}
              >
                {userData?.email ? 'Update' : 'Add Email'}
              </button>
            </div>
            
            {userData?.email && !userData.emailVerified && (
              <button
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                onClick={handleSendEmailVerification}
                disabled={verificationLoading}
              >
                <Mail size={14} className="mr-1" />
                {verificationLoading ? 'Sending...' : 'Send verification code'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Posts</h2>
        <div className="space-y-4">
          <UserPosts username={username} />
        </div>
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Update Email</h3>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            />
            {verificationError && (
              <div className="text-red-500 mb-4 text-sm">{verificationError}</div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setNewEmail('');
                  setVerificationError('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEmail}
                disabled={!newEmail || verificationLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {verificationLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {verificationType === 'email' ? 'Verify Email' : 'Verify'}
            </h3>
            <p className="text-gray-600 mb-4">
              {verificationSent
                ? `A verification code has been sent to your ${
                    verificationType === 'email' ? 'email' : ''
                  }. Please enter it below.`
                : `Please click "Send Code" to receive a verification code on your ${
                    verificationType === 'email' ? 'email' : ''
                  }.`}
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter verification code"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            />
            {verificationError && (
              <div className="text-red-500 mb-4 text-sm">{verificationError}</div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationCode('');
                  setVerificationError('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={verificationSent ? handleVerify : verificationType === 'email' ? handleSendEmailVerification : null}
                disabled={verificationSent && !verificationCode || verificationLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {verificationLoading
                  ? 'Processing...'
                  : verificationSent
                  ? 'Verify'
                  : 'Send Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;