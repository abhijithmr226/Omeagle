import React, { useState } from 'react';

interface ContactPageProps { onBack: () => void; }
export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const [sent, setSent] = useState(false);
  return (
    <div className="page-container">
      <button className="page-back" onClick={onBack}>&larr; Back</button>
      <h1>Contact Us</h1>
      <p>Have questions, feedback, or need support? Reach out to us.</p>
      <div className="contact-methods">
        <div className="contact-card">
          <h3>GitHub</h3>
          <p>Report issues or contribute to the project</p>
          <a href="https://github.com/abhijithmr226" target="_blank" rel="noreferrer" className="contact-link">github.com/abhijithmr226</a>
        </div>
        <div className="contact-card">
          <h3>LinkedIn</h3>
          <p>Connect with the developer</p>
          <a href="https://linkedin.com/in/abhijithmr226" target="_blank" rel="noreferrer" className="contact-link">linkedin.com/in/abhijithmr226</a>
        </div>
      </div>
      {!sent ? (
        <form className="contact-form" onSubmit={e => { e.preventDefault(); setSent(true); }}>
          <input type="text" placeholder="Your name" className="contact-input" required />
          <input type="email" placeholder="Your email" className="contact-input" required />
          <textarea placeholder="Your message" className="contact-textarea" rows={5} required />
          <button type="submit" className="contact-submit">Send Message</button>
        </form>
      ) : (
        <div className="contact-success">
          <p>Thank you! Your message has been sent.</p>
        </div>
      )}
    </div>
  );
};
