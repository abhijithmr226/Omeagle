import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PrivacyPage } from '../components/Pages/PrivacyPage';
import { usePageMeta } from '../hooks/usePageMeta';

export const Privacy: React.FC = () => {
  const navigate = useNavigate();
  usePageMeta(
    'Privacy Policy — Omeagle Anonymous Video Chat | Zero Data Collection',
    'Omeagle\'s full privacy policy. We collect zero personal data. No email, no name, no recordings. Peer-to-peer WebRTC video never passes through our servers. Read the full policy.'
  );
  return <PrivacyPage onBack={() => navigate(-1)} />;
};
