import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SafetyPage } from '../components/Pages/SafetyPage';

export const Safety: React.FC = () => {
  const navigate = useNavigate();
  return <SafetyPage onBack={() => navigate(-1)} />;
};
