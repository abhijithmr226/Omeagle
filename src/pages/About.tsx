import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AboutPage } from '../components/Pages/AboutPage';
import { usePageMeta } from '../hooks/usePageMeta';

export const About: React.FC = () => {
  const navigate = useNavigate();
  usePageMeta(
    'About Omeagle — Free Anonymous Video Chat & Best Omegle Alternative',
    'Learn about Omeagle: the free, no sign-up random video chat platform. Discover how it works, our mission, safety features, and why it\'s the best Omegle alternative in 2026.'
  );
  return <AboutPage onBack={() => navigate(-1)} />;
};
