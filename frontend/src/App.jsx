import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './services/api';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import SearchResults from './components/SearchResults';
import Notifications from './pages/Notifications';
import PostDetail from './pages/PostDetail';


function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const response = await auth.validate();
          if (response.data.valid) {
            setUser(JSON.parse(savedUser));
          } else {
            throw new Error('Session invalid');
          }
        } catch (err) {
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    validateSession();
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
     <Router>
     <div className="min-h-screen bg-gray-50">
       <Navbar user={user} setUser={setUser} />
       <main className="max-w-4xl mx-auto px-4 py-6">
         <Routes>
           <Route path="/" element={<Home user={user} />} />
           <Route
             path="/register"
             element={<Register onRegisterSuccess={handleAuthSuccess} />}
           />
           <Route
             path="/login"
             element={<Login setUser={setUser} />} 
           />
           <Route 
             path="/profile/:username" 
             element={<Profile user={user} onUserUpdate={handleUserUpdate} />} 
           />
           <Route path="/search" element={<SearchResults />} />
           <Route path="/notifications" element={<Notifications />} />
           <Route path="/post/:postId" element={<PostDetail />} />
         </Routes>
       </main>
     </div>
   </Router>
 );
}

export default App;