import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search users..."
          className={`w-full pl-10 pr-12 py-2 border-2 rounded-lg
                     placeholder:text-gray-400 transition-all duration-200
                     ${isFocused
                       ? 'border-white bg-white text-gray-800 shadow-lg'
                       : 'border-blue-400 bg-blue-500/30 text-white'}`}
          aria-label="Search users"
        />
        <Search
          className={`absolute left-3 top-2.5 transition-colors ${isFocused ? 'text-blue-500' : 'text-white'}`}
          size={18}
        />
        <button
          type="submit"
          className={`absolute right-3 top-2 text-xs font-medium rounded px-2 py-1 transition-colors ${
            isFocused ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white opacity-70'
          }`}
        >
          Search
        </button>
      </div>
      <div className={`absolute inset-0 rounded-lg transition-opacity pointer-events-none ${isFocused ? 'shadow-lg' : ''}`}></div>
    </form>
  );
};

export default SearchBar;