import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TermsPage } from '../components/Pages/TermsPage';
import { usePageMeta } from '../hooks/usePageMeta';

export const Terms: React.FC = () => {
  const navigate = useNavigate();
  usePageMeta(
    'Terms of Service — Omeagle Random Video Chat Platform',
    'Omeagle\'s Terms of Service. Read our usage policies, community guidelines, age requirements (18+), and prohibited activities before using our free random video chat platform.'
  );
  return <TermsPage onBack={() => navigate(-1)} />;
};
