import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Ban, Lock, AlertTriangle, Users, MessageCircle, Camera } from 'lucide-react';

interface SafetyPageProps {
  onBack?: () => void;
}

export const SafetyPage: React.FC<SafetyPageProps> = ({ onBack }) => {
  return (
    <div className="page-container safety-page">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> Back
      </button>

      <header className="safety-header">
        <Shield size={40} className="safety-icon" />
        <h1>Staying Safe on Omeagle</h1>
        <p className="safety-subtitle">
          Your safety is our top priority. Here is everything you need to know about staying safe while using Omeagle.
        </p>
      </header>

      <section className="safety-section">
        <h2>How Omeagle Protects You</h2>
        <div className="safety-cards">
          <div className="safety-card">
            <Eye size={28} />
            <h3>AI-Powered Moderation</h3>
            <p>Real-time visual and text analysis detects inappropriate content and flags violations instantly. The system works around the clock to keep conversations safe.</p>
          </div>
          <div className="safety-card">
            <Lock size={28} />
            <h3>End-to-End Encryption</h3>
            <p>All video and audio streams use WebRTC encryption. Your conversations travel directly between devices and never pass through Omeagle servers in an accessible format.</p>
          </div>
          <div className="safety-card">
            <Ban size={28} />
            <h3>Report and Block</h3>
            <p>Immediately report any user who violates community guidelines. Block anyone to prevent future matches. These tools are available during every conversation.</p>
          </div>
          <div className="safety-card">
            <Users size={28} />
            <h3>No Data Collection</h3>
            <p>No sign up, no profiles, no personal data. Omeagle does not collect or store your information. When you close your browser, your session is gone.</p>
          </div>
        </div>
      </section>

      <section className="safety-section">
        <h2>Community Guidelines</h2>
        <p>To keep Omeagle safe and enjoyable for everyone, all users must follow these rules:</p>
        <ul className="safety-rules">
          <li>
            <strong>Be respectful</strong> — Treat every stranger with courtesy and kindness. Remember there is a real person on the other end.
          </li>
          <li>
            <strong>No explicit content</strong> — Do not share sexually explicit, violent, or otherwise inappropriate content. Violations result in immediate bans.
          </li>
          <li>
            <strong>No harassment</strong> — Bullying, threats, and targeted abuse are not tolerated and result in immediate account restrictions.
          </li>
          <li>
            <strong>No spam or solicitation</strong> — Do not promote products, services, or personal social media accounts.
          </li>
          <li>
            <strong>No minors</strong> — Omeagle is strictly for users 18 and older. Users under 18 are not permitted to use the platform.
          </li>
          <li>
            <strong>Report violations</strong> — If you see someone breaking the rules, report them to protect the community.
          </li>
        </ul>
      </section>

      <section className="safety-section">
        <h2>Tips for Staying Safe</h2>
        <p>While Omeagle has robust safety systems in place, here are additional steps you can take to protect yourself:</p>

        <div className="safety-tips">
          <div className="safety-tip">
            <h3>Never Share Personal Information</h3>
            <p>Do not reveal your full name, address, phone number, workplace, school, or any other identifying details during conversations.</p>
          </div>
          <div className="safety-tip">
            <h3>Use a Neutral Background</h3>
            <p>Avoid showing identifiable locations in your camera view. Use a plain wall or blur your background if possible.</p>
          </div>
          <div className="safety-tip">
            <h3>Trust Your Instincts</h3>
            <p>If something feels wrong or uncomfortable, click Next or Stop immediately. You owe no explanation to anyone.</p>
          </div>
          <div className="safety-tip">
            <h3>Keep Conversations Light</h3>
            <p>Avoid sharing sensitive personal topics with strangers. Keep conversations fun and light-hearted.</p>
          </div>
          <div className="safety-tip">
            <h3>Use Text Chat if Uncomfortable</h3>
            <p>Not ready for video? Text chat gives you the same random stranger experience without showing your face.</p>
          </div>
          <div className="safety-tip">
            <h3>Report Inappropriate Behavior</h3>
            <p>Use the report button to flag users who violate guidelines. This helps keep the entire community safe.</p>
          </div>
        </div>
      </section>

      <section className="safety-section">
        <h2>For Parents</h2>
        <p>
          Omeagle is designed for users who are 18 years or older. We strongly recommend that parents monitor their children's online activity and use parental controls to prevent access to random chat platforms.
        </p>
        <p>
          If you are a parent concerned about your child's online safety, resources are available from the{' '}
          <a href="https://www.staysafeonline.org/" target="_blank" rel="noopener noreferrer">
            National Cyber Security Alliance
          </a>{' '}
          and the{' '}
          <a href="https://www.cybercivilrights.org/" target="_blank" rel="noopener noreferrer">
            Cyber Civil Rights Initiative
          </a>.
        </p>
      </section>

      <section className="safety-section safety-cta">
        <h2>Questions About Safety?</h2>
        <p>
          If you have any concerns about safety on Omeagle, please reach out. We are here to help.
        </p>
        <div className="safety-cta-buttons">
          <Link to="/contact" className="safety-btn-primary">Contact Us</Link>
          <Link to="/" className="safety-btn-secondary">Start Chatting</Link>
        </div>
      </section>

      <style>{`
        .safety-page { max-width: 820px; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
        .back-btn { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); background: var(--bg-surface-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-full); padding: 0.5rem 1rem; margin-bottom: 1.5rem; transition: all 0.2s; }
        .back-btn:hover { color: var(--brand-blue); border-color: var(--brand-blue); background: var(--brand-blue-light); }
        .safety-header { text-align: center; margin-bottom: 2.5rem; }
        .safety-icon { color: var(--brand-blue); margin-bottom: 0.75rem; }
        .safety-header h1 { font-size: 2.2rem; margin-bottom: 0.75rem; font-family: var(--font-heading); }
        .safety-subtitle { font-size: 1.1rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto; line-height: 1.6; }
        .safety-section { margin-bottom: 2.5rem; }
        .safety-section h2 { font-size: 1.5rem; margin-bottom: 1rem; }
        .safety-section p { margin-bottom: 1rem; line-height: 1.75; color: var(--text-secondary); font-size: 1.02rem; }
        .safety-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem; }
        .safety-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; transition: border-color 0.2s; }
        .safety-card:hover { border-color: var(--brand-blue); }
        .safety-card svg { color: var(--brand-blue); margin-bottom: 0.5rem; }
        .safety-card h3 { font-size: 1.05rem; margin-bottom: 0.5rem; }
        .safety-card p { font-size: 0.92rem; margin: 0; color: var(--text-muted); }
        .safety-rules { list-style: none; padding: 0; }
        .safety-rules li { padding: 1rem 1.25rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 0.75rem; line-height: 1.7; color: var(--text-secondary); }
        .safety-rules li strong { color: var(--text-primary); }
        .safety-tips { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem; }
        .safety-tip { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; }
        .safety-tip h3 { font-size: 1rem; margin-bottom: 0.5rem; color: var(--brand-blue); }
        .safety-tip p { font-size: 0.92rem; margin: 0; color: var(--text-muted); line-height: 1.6; }
        .safety-cta { text-align: center; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 2.5rem 2rem; }
        .safety-cta h2 { margin-bottom: 0.75rem; }
        .safety-cta p { max-width: 500px; margin: 0 auto 1.5rem; }
        .safety-cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .safety-btn-primary { display: inline-flex; padding: 0.85rem 2rem; background: var(--brand-blue); color: #fff; font-weight: 700; font-size: 1rem; border-radius: var(--radius-md); text-decoration: none; transition: background 0.2s; }
        .safety-btn-primary:hover { background: var(--brand-blue-hover); color: #fff; text-decoration: none; }
        .safety-btn-secondary { display: inline-flex; padding: 0.85rem 2rem; background: var(--bg-surface-secondary); color: var(--text-primary); font-weight: 700; font-size: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); text-decoration: none; transition: all 0.2s; }
        .safety-btn-secondary:hover { border-color: var(--brand-blue); color: var(--brand-blue); text-decoration: none; }
        @media (max-width: 768px) {
          .safety-header h1 { font-size: 1.6rem; }
          .safety-cards { grid-template-columns: 1fr; }
          .safety-tips { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
