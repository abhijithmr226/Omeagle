import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AboutPage } from '../components/Pages/AboutPage';

export const About: React.FC = () => {
  const navigate = useNavigate();
  return <AboutPage onBack={() => navigate(-1)} />;
};
