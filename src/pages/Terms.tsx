import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TermsPage } from '../components/Pages/TermsPage';

export const Terms: React.FC = () => {
  const navigate = useNavigate();
  return <TermsPage onBack={() => navigate(-1)} />;
};
