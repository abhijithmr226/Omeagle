import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Github, Linkedin, MessageSquare, Send, CheckCircle, Clock, MapPin } from 'lucide-react';

interface ContactPageProps { onBack: () => void; }

export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  return (
    <div className="page-container contact-page">
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> Back
      </button>

      <header className="contact-header">
        <h1>Contact Omeagle</h1>
        <p className="contact-subtitle">
          Have a question, found a bug, or want to report a safety concern? We're here to help.
          Choose the best way to reach us below.
        </p>
      </header>

      <div className="contact-grid">
        <div className="contact-info">
          <h2>Get in Touch</h2>

          <div className="contact-cards">
            <a href="https://github.com/abhijithmr226" target="_blank" rel="noreferrer" className="contact-card-link">
              <div className="contact-card">
                <Github size={24} />
                <div>
                  <strong>GitHub</strong>
                  <p>Report bugs, request features, or contribute to the project</p>
                  <span className="contact-card-action">github.com/abhijithmr226 →</span>
                </div>
              </div>
            </a>

            <a href="https://linkedin.com/in/abhijithmr226" target="_blank" rel="noreferrer" className="contact-card-link">
              <div className="contact-card">
                <Linkedin size={24} />
                <div>
                  <strong>LinkedIn</strong>
                  <p>Connect with the developer for business inquiries or partnerships</p>
                  <span className="contact-card-action">linkedin.com/in/abhijithmr226 →</span>
                </div>
              </div>
            </a>

            <Link to="/safety" className="contact-card-link">
              <div className="contact-card">
                <MessageSquare size={24} />
                <div>
                  <strong>Safety Concerns</strong>
                  <p>To report harmful content or request content removal</p>
                  <span className="contact-card-action">Visit Safety Guide →</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="contact-response-time">
            <Clock size={16} />
            <span>Typical response time: <strong>1–3 business days</strong></span>
          </div>

          <div className="contact-faq">
            <h3>Common Questions</h3>
            <div className="contact-faq-item">
              <strong>How do I report a user?</strong>
              <p>Use the report button during a chat session. Read our <Link to="/safety">Safety Guide</Link> for details.</p>
            </div>
            <div className="contact-faq-item">
              <strong>Is my camera/mic data recorded?</strong>
              <p>No. Video is peer-to-peer via WebRTC. We never access or store it. See our <Link to="/privacy">Privacy Policy</Link>.</p>
            </div>
            <div className="contact-faq-item">
              <strong>My video chat won't connect. Help?</strong>
              <p>Try Chrome or Firefox, ensure camera permissions are granted, and check if a corporate firewall is blocking WebRTC.</p>
            </div>
            <div className="contact-faq-item">
              <strong>Can I get a feature added?</strong>
              <p>Open a feature request on <a href="https://github.com/abhijithmr226" target="_blank" rel="noreferrer">GitHub</a> — we read every suggestion.</p>
            </div>
          </div>
        </div>

        <div className="contact-form-panel">
          <h2>Send a Message</h2>
          {!sent ? (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="contact-name">Your Name</label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="John Doe"
                  className="contact-input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="you@example.com"
                  className="contact-input"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="contact-subject">Subject</label>
                <select
                  id="contact-subject"
                  className="contact-input"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  required
                >
                  <option value="">Select a topic...</option>
                  <option value="bug">Bug Report</option>
                  <option value="safety">Safety / Content Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="partnership">Business / Partnership</option>
                  <option value="privacy">Privacy Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  placeholder="Describe your question or issue in detail..."
                  className="contact-textarea"
                  rows={6}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="contact-submit" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">Sending…</span>
                ) : (
                  <><Send size={18} /> Send Message</>
                )}
              </button>
            </form>
          ) : (
            <div className="contact-success">
              <CheckCircle size={48} />
              <h3>Message Sent!</h3>
              <p>Thank you for reaching out. We'll get back to you within 1–3 business days.</p>
              <button className="contact-reset" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                Send Another Message
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .contact-page { max-width: 960px; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
        .back-btn { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); background: var(--bg-surface-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-full); padding: 0.5rem 1rem; margin-bottom: 1.5rem; transition: all 0.2s; }
        .back-btn:hover { color: var(--brand-blue); border-color: var(--brand-blue); background: var(--brand-blue-light); }
        .contact-header { margin-bottom: 2.5rem; }
        .contact-header h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.75rem; }
        .contact-subtitle { font-size: 1.1rem; color: var(--text-secondary); line-height: 1.65; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
        .contact-info h2, .contact-form-panel h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 1.25rem; }
        .contact-cards { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
        .contact-card-link { text-decoration: none; }
        .contact-card { display: flex; gap: 1rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.1rem 1.25rem; transition: border-color 0.2s; }
        .contact-card:hover { border-color: var(--brand-blue); }
        .contact-card svg { flex-shrink: 0; color: var(--brand-blue); margin-top: 0.1rem; }
        .contact-card strong { display: block; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.2rem; }
        .contact-card p { margin: 0 0 0.25rem; font-size: 0.875rem; color: var(--text-muted); }
        .contact-card-action { font-size: 0.8rem; font-weight: 600; color: var(--brand-blue); }
        .contact-response-time { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem; }
        .contact-faq h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; }
        .contact-faq-item { margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }
        .contact-faq-item:last-child { border-bottom: none; margin-bottom: 0; }
        .contact-faq-item strong { display: block; margin-bottom: 0.25rem; font-size: 0.9rem; color: var(--text-primary); }
        .contact-faq-item p { font-size: 0.875rem; color: var(--text-muted); margin: 0; line-height: 1.55; }
        .contact-faq-item a { color: var(--brand-blue); text-decoration: none; font-weight: 500; }
        .contact-faq-item a:hover { text-decoration: underline; }
        .contact-form { display: flex; flex-direction: column; gap: 1.1rem; }
        .form-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-field label { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
        .contact-input { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.7rem 0.9rem; font-size: 0.95rem; color: var(--text-primary); width: 100%; transition: border-color 0.2s; }
        .contact-input:focus { outline: none; border-color: var(--brand-blue); }
        .contact-textarea { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.7rem 0.9rem; font-size: 0.95rem; color: var(--text-primary); width: 100%; resize: vertical; transition: border-color 0.2s; font-family: inherit; }
        .contact-textarea:focus { outline: none; border-color: var(--brand-blue); }
        .contact-submit { display: flex; align-items: center; justify-content: center; gap: 0.6rem; padding: 0.85rem; background: var(--brand-blue); color: #fff; font-weight: 700; font-size: 1rem; border-radius: var(--radius-md); cursor: pointer; transition: background 0.2s; }
        .contact-submit:hover:not(:disabled) { background: var(--brand-blue-hover); }
        .contact-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .contact-success { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 3rem 2rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); gap: 1rem; }
        .contact-success svg { color: #22c55e; }
        .contact-success h3 { font-size: 1.4rem; margin: 0; }
        .contact-success p { color: var(--text-secondary); margin: 0; }
        .contact-reset { margin-top: 0.5rem; padding: 0.7rem 1.5rem; background: var(--bg-surface-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; font-weight: 600; cursor: pointer; color: var(--text-primary); transition: all 0.2s; }
        .contact-reset:hover { border-color: var(--brand-blue); color: var(--brand-blue); }
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr; gap: 2rem; }
          .contact-header h1 { font-size: 1.75rem; }
        }
      `}</style>
    </div>
  );
};
