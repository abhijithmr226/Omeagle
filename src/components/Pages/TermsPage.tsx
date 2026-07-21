import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, Ban, AlertTriangle, Scale, RefreshCw } from 'lucide-react';

interface TermsPageProps { onBack: () => void; }

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => (
  <div className="page-container policy-page">
    <button className="back-btn" onClick={onBack}>
      <ArrowLeft size={18} /> Back
    </button>

    <header className="policy-header">
      <FileText size={36} className="policy-icon" />
      <h1>Terms of Service</h1>
      <p className="policy-meta"><em>Last updated: July 21, 2026</em></p>
      <p className="policy-subtitle">
        By using Omeagle, you agree to these Terms of Service. Please read them carefully.
        These terms govern your use of the platform and protect both you and other users.
      </p>
    </header>

    <nav className="policy-toc">
      <h2>Contents</h2>
      <ol>
        <li><a href="#acceptance">Acceptance of Terms</a></li>
        <li><a href="#age">Age Requirement</a></li>
        <li><a href="#service">Description of Service</a></li>
        <li><a href="#conduct">User Conduct</a></li>
        <li><a href="#prohibited">Prohibited Activities</a></li>
        <li><a href="#moderation">Content Moderation</a></li>
        <li><a href="#intellectual">Intellectual Property</a></li>
        <li><a href="#disclaimer">Disclaimers</a></li>
        <li><a href="#liability">Limitation of Liability</a></li>
        <li><a href="#indemnification">Indemnification</a></li>
        <li><a href="#termination">Termination</a></li>
        <li><a href="#governing-law">Governing Law</a></li>
        <li><a href="#changes">Changes to Terms</a></li>
        <li><a href="#contact">Contact</a></li>
      </ol>
    </nav>

    <section id="acceptance" className="policy-section">
      <h2><FileText size={20} /> Acceptance of Terms</h2>
      <p>
        By accessing or using Omeagle at <strong>omeagle.online</strong> (the "Service"), you agree
        to be legally bound by these Terms of Service ("Terms") and our{' '}
        <Link to="/privacy">Privacy Policy</Link>. If you do not agree to these Terms, you must
        immediately stop using the Service.
      </p>
      <p>
        These Terms constitute the entire agreement between you and Omeagle regarding your use of the
        Service and supersede all prior agreements and understandings.
      </p>
    </section>

    <section id="age" className="policy-section">
      <h2>Age Requirement</h2>
      <p>
        You must be <strong>at least 18 years old</strong> to use Omeagle. By accessing the Service,
        you represent and warrant that you are 18 years of age or older. If you are under 18, you
        are not permitted to use this platform under any circumstances.
      </p>
      <p>
        We implement an age confirmation gate on every session. However, we rely on users to
        accurately confirm their age. If we discover that a user under 18 is using the platform, we
        will immediately terminate their session and take steps to prevent future access.
      </p>
      <p>
        Parents and guardians should use parental control software to prevent minors from accessing
        random chat platforms. See our <Link to="/safety">Safety Guide</Link> for resources.
      </p>
    </section>

    <section id="service" className="policy-section">
      <h2>Description of Service</h2>
      <p>
        Omeagle provides a free, anonymous, browser-based platform for random video chat and text chat
        between strangers. The Service includes:
      </p>
      <ul>
        <li>Random matchmaking between anonymous users</li>
        <li>Peer-to-peer WebRTC video and audio communication</li>
        <li>Real-time text messaging between matched users</li>
        <li>User preference settings (country, gender, interests)</li>
        <li>Reporting and blocking tools</li>
        <li>AI-powered content moderation</li>
      </ul>
      <p>
        The Service is provided "as is" and Omeagle reserves the right to modify, suspend, or
        discontinue any feature at any time without notice.
      </p>
    </section>

    <section id="conduct" className="policy-section">
      <h2><Shield size={20} /> User Conduct</h2>
      <p>By using Omeagle, you agree to conduct yourself in a respectful and lawful manner. You agree to:</p>
      <ul>
        <li>Treat all users with respect and dignity</li>
        <li>Comply with all applicable local, national, and international laws</li>
        <li>Use the Service only for its intended purpose of random conversation</li>
        <li>Report violations of these Terms using the provided reporting tools</li>
        <li>Not share personal information about yourself that could put you at risk</li>
        <li>Not attempt to circumvent any safety or moderation systems</li>
      </ul>
    </section>

    <section id="prohibited" className="policy-section">
      <h2><Ban size={20} /> Prohibited Activities</h2>
      <p>The following activities are strictly prohibited on Omeagle and will result in immediate account restriction or permanent ban:</p>
      <ul>
        <li><strong>Sexual content involving minors</strong> — Absolutely prohibited. Will be reported to law enforcement.</li>
        <li><strong>Non-consensual explicit content</strong> — Sharing sexual content without the other person's consent</li>
        <li><strong>Harassment and bullying</strong> — Threatening, intimidating, or targeting users based on any characteristic</li>
        <li><strong>Hate speech</strong> — Content that promotes hatred based on race, ethnicity, religion, gender, sexual orientation, or disability</li>
        <li><strong>Spam and solicitation</strong> — Promoting products, services, or social media accounts</li>
        <li><strong>Fraud and impersonation</strong> — Pretending to be another person or organization</li>
        <li><strong>Recording without consent</strong> — Recording, capturing, or redistributing conversations without the explicit consent of all parties</li>
        <li><strong>Automated bots</strong> — Using scripts or automated tools to interact with the Service</li>
        <li><strong>Illegal activity</strong> — Using the platform to facilitate any illegal activity</li>
        <li><strong>Platform abuse</strong> — Attempting to reverse-engineer, exploit, or disrupt the Service</li>
      </ul>
    </section>

    <section id="moderation" className="policy-section">
      <h2>Content Moderation</h2>
      <p>
        Omeagle employs AI-powered content moderation to detect policy violations in real-time. We
        reserve the right to:
      </p>
      <ul>
        <li>Immediately terminate sessions that violate these Terms</li>
        <li>Restrict or permanently ban users who repeatedly violate guidelines</li>
        <li>Review reports submitted by community members</li>
        <li>Report illegal content (particularly CSAM) to appropriate law enforcement authorities</li>
      </ul>
      <p>
        All moderation decisions are made at Omeagle's sole discretion. There is no appeals process
        for session terminations, though we may consider appeals for permanent bans via our{' '}
        <Link to="/contact">Contact page</Link>.
      </p>
    </section>

    <section id="intellectual" className="policy-section">
      <h2>Intellectual Property</h2>
      <p>
        The Omeagle platform, including its design, code, brand identity, and content, is owned by
        Omeagle and protected by applicable intellectual property laws. You may not copy, reproduce,
        distribute, or create derivative works based on the platform without explicit written permission.
      </p>
      <p>
        The content of individual conversations belongs to the participants. By using the platform, you
        grant Omeagle no rights to your conversation content (which is peer-to-peer and not accessible
        to us anyway).
      </p>
    </section>

    <section id="disclaimer" className="policy-section">
      <h2><AlertTriangle size={20} /> Disclaimers</h2>
      <p>
        Omeagle is provided <strong>"as is"</strong> and <strong>"as available"</strong> without
        warranties of any kind, express or implied. We do not warrant that:
      </p>
      <ul>
        <li>The Service will be uninterrupted, error-free, or secure</li>
        <li>Any matches will meet your preferences or expectations</li>
        <li>The platform will be free from harmful, offensive, or illegal content (despite our best moderation efforts)</li>
        <li>Any particular features will remain available</li>
      </ul>
      <p>
        You use the Service entirely at your own risk. Omeagle is <strong>not responsible</strong> for
        the actions, content, or conduct of users on the platform. Random chat with strangers carries
        inherent risks; please read our <Link to="/safety">Safety Guide</Link> before using the Service.
      </p>
    </section>

    <section id="liability" className="policy-section">
      <h2><Scale size={20} /> Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, Omeagle and its operators shall not be
        liable for any:
      </p>
      <ul>
        <li>Indirect, incidental, special, consequential, or punitive damages</li>
        <li>Loss of profits, data, goodwill, or other intangible losses</li>
        <li>Damages arising from your reliance on content provided by other users</li>
        <li>Unauthorized access to or use of our servers or any personal information stored therein</li>
        <li>Interruptions or cessation of transmission to or from the Service</li>
      </ul>
      <p>
        In jurisdictions that do not allow exclusion of certain warranties or limitation of liability,
        our liability is limited to the maximum extent permitted by law.
      </p>
    </section>

    <section id="indemnification" className="policy-section">
      <h2>Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless Omeagle and its operators from and against
        any claims, liabilities, damages, losses, and expenses (including legal fees) arising from:
      </p>
      <ul>
        <li>Your use of the Service in violation of these Terms</li>
        <li>Your violation of any applicable law or regulation</li>
        <li>Your violation of any third party's rights</li>
      </ul>
    </section>

    <section id="termination" className="policy-section">
      <h2>Termination</h2>
      <p>
        Omeagle reserves the right to suspend or permanently terminate your access to the Service at
        any time, without prior notice, for any reason — including but not limited to violations of
        these Terms, illegal activity, or conduct that we deem harmful to other users or the platform.
      </p>
      <p>
        Since Omeagle does not maintain user accounts, "termination" takes the form of session
        blocking by device fingerprint or IP address. Circumventing these blocks violates these Terms.
      </p>
    </section>

    <section id="governing-law" className="policy-section">
      <h2>Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with applicable law. Any disputes
        arising from these Terms or your use of the Service shall be resolved through binding
        arbitration where permitted, or in the courts of competent jurisdiction.
      </p>
    </section>

    <section id="changes" className="policy-section">
      <h2><RefreshCw size={20} /> Changes to Terms</h2>
      <p>
        We may modify these Terms at any time. When we do, we will update the "Last updated" date
        at the top of this page. Your continued use of the Service after any changes constitutes
        your acceptance of the new Terms. We encourage you to review this page periodically.
      </p>
    </section>

    <section id="contact" className="policy-section">
      <h2>Contact</h2>
      <p>
        If you have questions about these Terms, please visit our <Link to="/contact">Contact page</Link>.
        You may also wish to review our <Link to="/privacy">Privacy Policy</Link> and{' '}
        <Link to="/safety">Safety Guide</Link>.
      </p>
    </section>
  </div>
);
