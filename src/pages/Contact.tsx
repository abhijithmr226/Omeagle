import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactPage } from '../components/Pages/ContactPage';

export const Contact: React.FC = () => {
  const navigate = useNavigate();
  return <ContactPage onBack={() => navigate(-1)} />;
};
