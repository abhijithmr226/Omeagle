import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PrivacyPage } from '../components/Pages/PrivacyPage';

export const Privacy: React.FC = () => {
  const navigate = useNavigate();
  return <PrivacyPage onBack={() => navigate(-1)} />;
};
