import React from 'react';

interface TermsPageProps { onBack: () => void; }
export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => (
  <div className="page-container">
    <button className="page-back" onClick={onBack}>&larr; Back</button>
    <h1>Terms of Service</h1>
    <p><em>Last updated: July 2026</em></p>
    <h2>Acceptance of Terms</h2>
    <p>By accessing or using Omeagle, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.</p>
    <h2>Age Requirement</h2>
    <p>You must be at least 18 years old to use Omeagle. By using the platform, you confirm that you meet this age requirement.</p>
    <h2>User Conduct</h2>
    <p>You agree not to:</p>
    <ul>
      <li>Use the platform for any illegal purposes</li>
      <li>Harass, bully, or abuse other users</li>
      <li>Share inappropriate, explicit, or offensive content</li>
      <li>Impersonate another person or entity</li>
      <li>Attempt to exploit or manipulate the platform</li>
      <li>Record or redistribute conversations without consent</li>
    </ul>
    <h2>Content Moderation</h2>
    <p>We reserve the right to monitor, moderate, and terminate access to users who violate these terms or community guidelines.</p>
    <h2>Disclaimer</h2>
    <p>Omeagle is provided "as is" without warranties. We are not responsible for the actions, content, or conduct of users on the platform.</p>
    <h2>Termination</h2>
    <p>We reserve the right to suspend or terminate your access to Omeagle at our discretion, without prior notice, for conduct that violates these terms.</p>
    <h2>Limitation of Liability</h2>
    <p>To the maximum extent permitted by law, Omeagle shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
    <h2>Changes to Terms</h2>
    <p>We may modify these terms at any time. Continued use after changes constitutes acceptance of the new terms.</p>
  </div>
);
