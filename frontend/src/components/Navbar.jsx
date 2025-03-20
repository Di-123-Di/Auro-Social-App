import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, notifications } from '../services/api';
import { LogOut, User, LogIn, UserPlus, Menu, X, Search, Home, Bell } from 'lucide-react';
import SearchBar from './SearchBar';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);


  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const response = await notifications.getUnreadCount();
          setUnreadNotifications(response.data.count);
        } catch (error) {
          console.error('Failed to fetch unread count:', error);
        }
      };
      
      fetchUnreadCount();
      

      const intervalId = setInterval(fetchUnreadCount, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const handleNotificationsClick = async () => {
    if (user) {
      try {
        await notifications.markAllAsRead();
        setUnreadNotifications(0);
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
      }
    }
    navigate('/notifications');
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
     
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-white hover:text-blue-100 transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" className="h-8 w-8 mr-2">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6B6B" />
                    <stop offset="100%" stopColor="#9370DB" />
                  </linearGradient>
                </defs>
                <rect x="30" y="30" width="240" height="240" rx="50" ry="50" fill="url(#gradient)" />
                <circle cx="90" cy="100" r="20" fill="white" opacity="0.9" />
                <circle cx="210" cy="100" r="20" fill="white" opacity="0.9" />
                <circle cx="90" cy="200" r="20" fill="white" opacity="0.9" />
                <circle cx="210" cy="200" r="20" fill="white" opacity="0.9" />
                <path d="M90,100 C150,140 150,160 90,200" stroke="white" strokeWidth="6" fill="none" />
                <path d="M210,100 C150,140 150,160 210,200" stroke="white" strokeWidth="6" fill="none" />
                <path d="M90,100 C150,80 150,80 210,100" stroke="white" strokeWidth="6" fill="none" />
                <path d="M90,200 C150,220 150,220 210,200" stroke="white" strokeWidth="6" fill="none" />
                <circle cx="150" cy="150" r="40" fill="white" />
                <text x="150" y="170" fontFamily="Arial, sans-serif" fontSize="60" fontWeight="bold" textAnchor="middle" fill="#9370DB">a</text>
              </svg>
              <span className="font-bold tracking-wider">Auro</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-blue-100 p-2">
              <Home size={20} />
            </Link>
            <Link 
              to="/notifications" 
              className="text-white hover:text-blue-100 p-2 relative"
              onClick={handleNotificationsClick}
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 bg-accent-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>
          </div>

          <div className="hidden sm:block flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to={`/profile/${user.username}`}
                  className="flex items-center space-x-2 text-white hover:text-blue-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
                          e.target.style.display = 'none';
                          e.target.parentNode.classList.add("bg-white");
                          e.target.parentNode.innerHTML = `<span class="text-blue-600 font-bold">${user.username.charAt(0).toUpperCase()}</span>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center text-blue-600 font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="font-medium">{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-white bg-blue-800 hover:bg-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <LogOut size={18} className="inline mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 border border-white text-white hover:bg-white hover:text-blue-600 rounded-md transition-colors"
                >
                  <LogIn size={18} className="inline mr-1" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <UserPlus size={18} className="inline mr-1" />
                  <span className="hidden sm:inline">Register</span>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-100 focus:outline-none p-2"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-blue-700 px-2 pt-2 pb-4 space-y-3 animate-fade-in">
            <div className="pb-3">
              <SearchBar />
            </div>
            
            <Link
              to="/"
              className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={18} className="inline mr-2" />
              Home
            </Link>
            
            <Link
              to="/notifications"
              className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md"
              onClick={() => {
                handleNotificationsClick();
                setIsMenuOpen(false);
              }}
            >
              <Bell size={18} className="inline mr-2" />
              Notifications
              {unreadNotifications > 0 && (
                <span className="ml-2 bg-accent-500 text-white text-xs rounded-full px-2 py-1 inline-flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>
            
            {user ? (
              <>
                <Link
                  to={`/profile/${user.username}`}
                  className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="w-6 h-6 rounded-full mr-2 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'inline-block';
                        }}
                      />
                    ) : null}
                    <User size={18} className={`${user.avatar ? 'hidden' : 'inline'} mr-2`} />
                    Profile
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-white hover:bg-blue-600 rounded-md"
                >
                  <LogOut size={18} className="inline mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn size={18} className="inline mr-2" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-white hover:bg-blue-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserPlus size={18} className="inline mr-2" />
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;