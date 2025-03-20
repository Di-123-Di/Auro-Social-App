import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notifications } from '../services/api';
import { Heart, RefreshCw, MessageSquare, Clock } from 'lucide-react';

const Notifications = () => {
  const [notificationsList, setNotificationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notifications.getAll();
      setNotificationsList(response.data);
      
  
      await notifications.markAllAsRead();
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHour < 24) {
      return `${diffHour}h ago`;
    } else if (diffDay < 7) {
      return `${diffDay}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={20} className="text-red-500" />;
      case 'retweet':
        return <RefreshCw size={20} className="text-green-500" />;
      case 'comment':
        return <MessageSquare size={20} className="text-blue-500" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'retweet':
        return 'reposted your post';
      case 'comment':
        return 'commented on your post';
      default:
        return 'interacted with your post';
    }
  };

  const renderNotificationContent = (notification) => {
    if (notification.postContent) {
      return (
        <p className="text-gray-500 text-sm mt-1 line-clamp-1">
          "{notification.postContent}"
        </p>
      );
    }
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Notifications</h1>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      ) : notificationsList.length > 0 ? (
        <div className="space-y-4">
          {notificationsList.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg shadow-sm border bg-white transition-all hover:shadow-md ${!notification.read ? 'border-blue-200 bg-blue-50' : ''}`}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      {notification.fromUserAvatar ? (
                        <img
                          src={notification.fromUserAvatar}
                          alt={notification.fromUser}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.classList.add("bg-blue-500");
                            e.target.parentNode.innerHTML = `<span class="text-white font-bold flex items-center justify-center h-full">${notification.fromUser.charAt(0).toUpperCase()}</span>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-500 text-white font-bold flex items-center justify-center">
                          {notification.fromUser.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-800">
                        <span className="font-medium text-blue-600">{notification.fromUser}</span>
                        {' '}
                        {getNotificationText(notification)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  {renderNotificationContent(notification)}
                  {notification.postId && (
                    <Link
                      to={`/post/${notification.postId}`}
                      className="mt-2 text-sm text-blue-500 hover:underline inline-block"
                    >
                      View post
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No notifications yet</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;