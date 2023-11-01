import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { users } from '../services/api';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchTerm = searchParams.get('q');

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm) return;
      
      try {
        setLoading(true);
        const response = await users.search(searchTerm);
        setResults(response.data);
      } catch (err) {
        setError('Failed to fetch search results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchTerm]);

  if (loading) return (
    <div className="flex justify-center items-center p-12">
      <div className="flex items-center space-x-2 text-purple-600">
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span>Searching...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-red-500 bg-red-50 p-4 rounded-lg text-center">
        {error}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-purple-900 mb-6">
        Search results for "<span className="text-purple-600">{searchTerm}</span>"
      </h2>
      
      {results.length === 0 ? (
        <div className="bg-purple-50 text-purple-700 text-center p-8 rounded-lg">
          No users found matching "{searchTerm}"
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(user => (
            <Link
              key={user._id}
              to={`/profile/${user.username}`}
              className="block p-4 bg-white rounded-lg border border-purple-100 hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-purple-100">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `<span class="text-xl font-semibold text-purple-600">${user.username[0].toUpperCase()}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-xl font-semibold text-purple-600">
                      {user.username[0].toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-purple-900">
                      {user.username}
                    </h3>
                  </div>
                  
                  {user.description && (
                    <p className="text-gray-600 mt-1 line-clamp-2">
                      {user.description}
                    </p>
                  )}
                  
                  {user.status && (
                    <p className="text-sm text-purple-600 mt-2 italic">
                      {user.status}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;