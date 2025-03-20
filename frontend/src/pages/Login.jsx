import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, users } from '../services/api';

const Login = ({ setUser }) => { 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {

      const loginResponse = await auth.login({
        username: formData.username,
        password: formData.password
      });
      
 
      try {
        const userResponse = await users.getProfile(loginResponse.data.username);
        
        const userData = {
          username: loginResponse.data.username,
          _id: loginResponse.data._id,
          avatar: userResponse.data.avatar
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData); 
        navigate('/'); 
      } catch (profileError) {
        console.error('获取用户资料时出错:', profileError);
        
        const basicUserData = {
          username: loginResponse.data.username,
          _id: loginResponse.data._id
        };
        localStorage.setItem('user', JSON.stringify(basicUserData));
        setUser(basicUserData);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-blue-100 p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Log in to your Auro account</p>
        </div>
      
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="mr-2">Logging in</span>
                <span>...</span>
              </span>
            ) : (
              'Log in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;