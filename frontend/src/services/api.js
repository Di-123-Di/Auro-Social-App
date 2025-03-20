import axios from 'axios';


const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';


const api = axios.create({
 baseURL,
 withCredentials: true,
 headers: {
   'Accept': 'application/json'
 }
});


export const auth = {
 register: (userData) => api.post('/users/signup', userData),
 login: (credentials) => api.post('/users/login', credentials),
 loginWithEmail: (credentials) => api.post('/users/login/email', credentials),
 logout: () => api.post('/users/logout'),
 validate: () => api.get('/users/validate-token'),

 sendEmailVerification: () => api.post('/users/verify/email/send'),
 verifyEmail: (code) => api.post('/users/verify/email', { code }),

 updateEmail: (email) => api.post('/users/update/email', { email })
};


export const posts = {
 getAll: () => api.get('/posts'),
 getById: (postId) => api.get(`/posts/${postId}/detail`),
 getUserPosts: (username) => api.get(`/posts/user/${username}`),
 getPostDetails: (postId) => api.get(`/posts/${postId}/detail?t=${Date.now()}`),
 create: (formData) => {
   return api.post('/posts', formData);
 },
 update: (postId, content) => api.put(`/posts/${postId}`, { content }),
 delete: (postId) => api.delete(`/posts/${postId}`),

 like: (postId) => api.post(`/posts/${postId}/like`),
 retweet: (postId) => api.post(`/posts/${postId}/retweet`),
 share: (postId) => api.post(`/posts/${postId}/share`),
 addComment: (postId, content) => api.post(`/posts/${postId}/comments`, { content }),
 getComments: (postId) => api.get(`/posts/${postId}/comments`),
 deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
 quoteRetweet: (postId, content) => api.post(`/posts/${postId}/quote`, { content })
};


export const users = {
 search: (term) => api.get(`/users/search/${term}`),
 getProfile: (username) => api.get(`/users/${username}`)
};

export const notifications = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};