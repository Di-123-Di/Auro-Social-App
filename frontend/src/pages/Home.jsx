import React from 'react';
import PostList from '../components/PostList';

const Home = ({ user }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <PostList />
    </div>
  );
};

export default Home;