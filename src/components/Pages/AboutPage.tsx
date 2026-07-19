import React from 'react';

interface AboutPageProps { onBack: () => void; }
export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => (
  <div className="page-container">
    <button className="page-back" onClick={onBack}>&larr; Back</button>
    <h1>About Omeagle</h1>
    <p>Omeagle is a free platform that lets you talk to strangers from around the world through video chat and text chat. Our mission is to connect people across boundaries and help build meaningful connections.</p>
    <h2>How It Works</h2>
    <p>Simply click "Start" and you'll be randomly paired with another user. If you don't click with someone, click "Next" to be connected with a new stranger. It's that simple.</p>
    <h2>Our Mission</h2>
    <p>We believe that human connection should be accessible to everyone. Omeagle provides a safe, anonymous platform where people can meet, chat, and discover new perspectives without any barriers.</p>
    <h2>Safety</h2>
    <p>We take safety seriously. Our platform includes reporting tools, moderation systems, and safety guidelines to ensure a positive experience for all users.</p>
    <div className="page-developer">
      <p>Developed by <a href="https://github.com/abhijithmr226" target="_blank" rel="noreferrer">abhijithmr226</a></p>
      <p><a href="https://linkedin.com/in/abhijithmr226" target="_blank" rel="noreferrer">LinkedIn</a> | <a href="https://github.com/abhijithmr226" target="_blank" rel="noreferrer">GitHub</a></p>
    </div>
  </div>
);
