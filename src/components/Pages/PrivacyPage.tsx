import React from 'react';
import { Link } from 'react-router-dom';

interface PrivacyPageProps { onBack: () => void; }
export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => (
  <div className="page-container">
    <button className="page-back" onClick={onBack}>&larr; Back</button>
    <h1>Privacy Policy</h1>
    <p><em>Last updated: July 2026</em></p>
    <h2>Information We Collect</h2>
    <p>Omeagle is designed to be anonymous. We do not collect personal information such as your name, email address, or location. Video and text chats are peer-to-peer and are not stored on our servers.</p>
    <h2>How We Use Information</h2>
    <p>We may collect anonymous usage data (such as connection counts and error logs) to improve the platform. This data cannot be used to identify you personally.</p>
    <h2>Cookies</h2>
    <p>We use minimal cookies necessary for the service to function. These cookies do not track you across other websites.</p>
    <h2>Third-Party Services</h2>
    <p>We use Google STUN servers for WebRTC connections. These servers facilitate peer-to-peer connections but do not receive your video or audio data.</p>
    <h2>Data Retention</h2>
    <p>Since chats are peer-to-peer, we do not retain chat content. Connection logs are deleted periodically.</p>
    <h2>Children's Privacy</h2>
    <p>Omeagle is not intended for users under 18. We do not knowingly collect data from minors.</p>
    <h2>Changes to This Policy</h2>
    <p>We may update this privacy policy from time to time. Continued use of the platform constitutes acceptance of the updated policy.</p>
    <h2>Contact</h2>
    <p>For privacy-related inquiries, visit our <Link to="/contact">Contact page</Link>.</p>
  </div>
);
