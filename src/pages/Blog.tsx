import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogPage } from '../components/Pages/BlogPage';

export const Blog: React.FC = () => {
  const navigate = useNavigate();
  return <BlogPage onBack={() => navigate(-1)} />;
};
