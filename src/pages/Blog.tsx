import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogPage } from '../components/Pages/BlogPage';
import { usePageMeta } from '../hooks/usePageMeta';

export const Blog: React.FC = () => {
  const navigate = useNavigate();
  usePageMeta(
    'Omeagle Blog — Video Chat Tips, Safety Guides & Omegle Alternatives (2026)',
    'The official Omeagle blog. Expert guides on video chat safety, the best Omegle alternatives, how WebRTC works, and no sign-up chat sites that actually work.'
  );
  return <BlogPage onBack={() => navigate(-1)} />;
};
