import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactPage } from '../components/Pages/ContactPage';
import { usePageMeta } from '../hooks/usePageMeta';

export const Contact: React.FC = () => {
  const navigate = useNavigate();
  usePageMeta(
    'Contact Omeagle — Report Issues, Safety Concerns & Feature Requests',
    'Contact the Omeagle team. Report bugs, submit safety concerns, request features, or ask about partnerships. We typically respond within 1–3 business days.'
  );
  return <ContactPage onBack={() => navigate(-1)} />;
};
