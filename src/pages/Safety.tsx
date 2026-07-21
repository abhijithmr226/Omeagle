import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SafetyPage } from '../components/Pages/SafetyPage';
import { usePageMeta } from '../hooks/usePageMeta';

export const Safety: React.FC = () => {
  const navigate = useNavigate();
  usePageMeta(
    'Safety Guide — How to Stay Safe on Omeagle | Random Video Chat Safety Tips',
    'Learn how to stay safe while video chatting with strangers on Omeagle. AI moderation, WebRTC encryption, report & block tools, and 10 essential safety tips for 2026.'
  );
  return <SafetyPage onBack={() => navigate(-1)} />;
};
