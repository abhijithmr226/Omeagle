import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, MessageSquare, Shield, Zap, Globe, Heart, Lock, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

interface LandingPageVariantProps {
  onStartChat: (mode: 'video' | 'text') => void;
  onlineCount: number;
}

interface PageConfig {
  title: string;
  metaDesc: string;
  h1: string;
  heroSub: string;
  badgeText: string;
  targetKeyword: string;
  features: Array<{ icon: any; title: string; desc: string }>;
  faqs: Array<{ q: string; a: string }>;
}

function generateDynamicConfig(slug: string): PageConfig {
  const cleanName = slug
    .replace(/^chat[-/]/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${cleanName} — Free Instant Random Video Chat (2026)`,
    metaDesc: `Experience ${cleanName.toLowerCase()} on Omeagle. Connect instantly with random strangers via live HD video & text chat. 100% free with zero signup or registration required.`,
    h1: `${cleanName} — Free Video Chat`,
    heroSub: `Talk to random strangers online with ${cleanName.toLowerCase()}. Instant 1-on-1 WebRTC video calling with complete anonymity.`,
    badgeText: '100% Free • WebRTC Powered',
    targetKeyword: cleanName.toLowerCase(),
    features: [
      { icon: Video, title: 'HD Webcam Streaming', desc: `Crystal-clear HD video chat optimized for ${cleanName.toLowerCase()}.` },
      { icon: Lock, title: 'No Registration Needed', desc: 'Jump straight into conversations without creating an account or sharing emails.' },
      { icon: Shield, title: 'Smart AI Moderation', desc: 'Automated 24/7 moderation protects users from inappropriate or offensive behavior.' },
      { icon: Globe, title: 'Global Stranger Matching', desc: 'Connect with people around the globe or use country and interest filters.' }
    ],
    faqs: [
      { q: `Is ${cleanName} free on Omeagle?`, a: `Yes, ${cleanName.toLowerCase()} on Omeagle is 100% free with zero coins, subscriptions, or credit card requirements.` },
      { q: `Do I need to download an app for ${cleanName}?`, a: `No download required. Omeagle runs natively in Chrome, Safari, Firefox, and Edge browsers on desktop and mobile.` },
      { q: `How does matching work for ${cleanName}?`, a: `Simply click Start Video Chat to be paired 1-on-1 with a live stranger in less than 2 seconds.` }
    ]
  };
}

const PAGE_CONFIGS: Record<string, PageConfig> = {
  'omegle-alternative-no-login': {
    title: 'Omegle Alternative No Login — Free Instant Random Video Chat 2026',
    metaDesc: 'Looking for an Omegle alternative with no login required? Omeagle lets you start instant video chat with strangers without sign up or account creation.',
    h1: 'Omegle Alternative No Login — Free Video Chat',
    heroSub: 'No sign up, no email address, and zero registration required. Experience instant 1-on-1 random video chat with strangers worldwide.',
    badgeText: '100% Free • No Account Needed',
    targetKeyword: 'omegle alternative no login',
    features: [
      { icon: Lock, title: 'No Account Required', desc: 'Start chatting in 1 click without entering an email, phone number, or password.' },
      { icon: Zap, title: 'Instant Matching', desc: 'Our fast WebRTC engine connects you with live strangers in less than 2 seconds.' },
      { icon: Shield, title: 'Privacy Protected', desc: 'No conversation logs, tracking cookies, or stored personal information.' },
      { icon: Globe, title: 'Global Reach', desc: 'Meet strangers from over 100+ countries with optional location filters.' }
    ],
    faqs: [
      { q: 'Is Omeagle really an Omegle alternative without login?', a: 'Yes! Omeagle allows you to start chatting immediately without creating an account or logging in.' },
      { q: 'Is it completely free?', a: '100% free with zero hidden coins, subscriptions, or credit card requirements.' },
      { q: 'Does Omeagle log my video chat?', a: 'No, connections are peer-to-peer (WebRTC). Video streams are transmitted directly between users and never recorded.' }
    ]
  },
  'random-video-chat-no-signup': {
    title: 'Random Video Chat Without Signup — Instant & Free Cam Chat',
    metaDesc: 'Start random video chat without signup on Omeagle. Connect instantly via live webcam with strangers worldwide. 100% free browser-based chat app.',
    h1: 'Random Video Chat Without Signup',
    heroSub: 'Skip the hassle of registration forms. Connect instantly to strangers via webcam with zero signup required.',
    badgeText: 'Instant Browser Cam Chat',
    targetKeyword: 'random video chat without signup',
    features: [
      { icon: Video, title: 'HD Webcam Streaming', desc: 'High-definition WebRTC video streaming directly inside your web browser.' },
      { icon: Zap, title: 'Zero Signup', desc: 'Never worry about password leaks or account verification.' },
      { icon: Shield, title: 'AI Moderation', desc: 'Real-time AI filters keep video rooms clean and safe for all users.' },
      { icon: Heart, title: 'Interest Matching', desc: 'Add custom topics to connect with strangers who share your hobbies.' }
    ],
    faqs: [
      { q: 'Can I video chat without making an account?', a: 'Yes, just click "Start Video Chat" and allow camera permissions to begin matching.' },
      { q: 'Does it work on mobile phones?', a: 'Yes, Omeagle is optimized for all desktop browsers, Android, and iPhone Safari.' }
    ]
  },
  'talk-to-strangers-free': {
    title: 'Talk to Strangers Free Video Call — Instant Anonymous Cam Chat',
    metaDesc: 'Talk to strangers online free with Omeagle. Connect with random people globally via HD video call & text chat. No fees, no limits.',
    h1: 'Talk to Strangers Online — Free Video Call',
    heroSub: 'Meet new people, practice languages, or make international friends through instant 1-on-1 video calling.',
    badgeText: 'Connect Worldwide 24/7',
    targetKeyword: 'talk to strangers video call free',
    features: [
      { icon: Globe, title: 'Worldwide Community', desc: 'Thousands of active strangers online right now from every continent.' },
      { icon: MessageSquare, title: 'Combined Text & Video', desc: 'Chat via text while on video call for smooth communication.' },
      { icon: Shield, title: 'One-Click Skip', desc: 'Easily skip to the next stranger whenever you want with instant swoosh.' },
      { icon: Sparkles, title: 'Free Forever', desc: 'No paywalls or coin systems. Enjoy unlimited stranger video calls.' }
    ],
    faqs: [
      { q: 'How do I start talking to strangers on Omeagle?', a: 'Click the "Start Video Chat" button above, grant camera access, and you will be paired with a random stranger instantly.' },
      { q: 'Can I filter strangers by country?', a: 'Yes, you can choose specific country preferences in matching settings.' }
    ]
  },
  'anonymous-video-chat-no-signup': {
    title: 'Anonymous Video Chat No Sign Up — 100% Free & Private Omeagle',
    metaDesc: 'Enjoy anonymous video chat with no sign up required. 100% private WebRTC webcam chat with random strangers.',
    h1: 'Anonymous Video Chat — No Sign Up Required',
    heroSub: 'Chat anonymously without disclosing your name, email, or personal identity. Complete privacy in your browser.',
    badgeText: '100% Anonymous & Secure',
    targetKeyword: 'anonymous video chat no sign up',
    features: [
      { icon: Lock, title: 'Strict Anonymity', desc: 'No profile details, profile pictures, or real names required.' },
      { icon: Shield, title: 'Peer-to-Peer Encryption', desc: 'WebRTC encrypts audio and video directly between participants.' },
      { icon: Zap, title: 'Instant Skip', desc: 'Switch partners in a fraction of a second with zero delay.' },
      { icon: CheckCircle2, title: 'Clean & Safe', desc: '24/7 moderation protects users from inappropriate behavior.' }
    ],
    faqs: [
      { q: 'Is anonymous video chat safe on Omeagle?', a: 'Yes, Omeagle uses WebRTC encryption and automated moderation to ensure privacy and safety.' }
    ]
  },
  'chat-india': {
    title: 'India Random Video Chat Free — Connect with Indian Strangers',
    metaDesc: 'Free India random video chat platform. Connect instantly with Indian strangers from Delhi, Mumbai, Bangalore, Kerala, Tamil Nadu & more.',
    h1: 'India Random Video Chat — Talk to Indian Strangers',
    heroSub: 'The #1 random video chat platform in India. Talk to Indian strangers free in Hindi, English, Tamil, Telugu, and regional languages.',
    badgeText: '🇮🇳 India Local & Global Matching',
    targetKeyword: 'india random video chat free',
    features: [
      { icon: Globe, title: 'Indian Regional Chat', desc: 'Connect with strangers across Delhi, Mumbai, Bangalore, Hyderabad, Chennai, and Kolkata.' },
      { icon: Zap, title: 'Low-Data Mode', desc: 'Optimized WebRTC video stream that runs smoothly on mobile 4G & 5G networks.' },
      { icon: Lock, title: 'No Account Required', desc: 'Zero registration or phone number verification needed.' },
      { icon: Heart, title: 'College & Regional Filters', desc: 'Find chat partners based on shared interests and languages.' }
    ],
    faqs: [
      { q: 'Is Indian video chat free on Omeagle?', a: 'Yes! It is 100% free with no coins, VIP memberships, or paid subscriptions.' },
      { q: 'Can I chat in Hindi or regional languages?', a: 'Yes, set your language or region preferences to match with speakers of your language.' }
    ]
  },
  'ometv-alternative': {
    title: 'Best Free OmeTV Alternative 2026 — No Ban & No Sign Up',
    metaDesc: 'Looking for a free OmeTV alternative? Omeagle offers instant video chat with strangers without unfair bans, paid gender coins, or login forms.',
    h1: 'Best Free OmeTV Alternative — Omeagle',
    heroSub: 'Tired of strict OmeTV bans and paid coins? Omeagle provides free, fair, and instant random webcam matching.',
    badgeText: 'No Coins • No Unfair Bans',
    targetKeyword: 'ometv alternative',
    features: [
      { icon: Sparkles, title: 'Free Gender & Location Filter', desc: 'Unlike OmeTV, matching options don’t require paid coins.' },
      { icon: Shield, title: 'Fair AI Moderation', desc: 'Smart reporting system prevents accidental or unfair IP bans.' },
      { icon: Zap, title: 'Instant Browser Connection', desc: 'No need to download mobile APKs or apps from the Play Store.' },
      { icon: Lock, title: '100% Free Access', desc: 'Unlimited chat duration with zero subscription fees.' }
    ],
    faqs: [
      { q: 'Why is Omeagle better than OmeTV?', a: 'Omeagle doesn’t charge money for matching filters or ban users arbitrarily.' }
    ]
  },
  'gender-filter-video-chat': {
    title: 'Free Omegle Alternative with Gender Filter — Omeagle 2026',
    metaDesc: 'Looking for a free video chat with gender filter? Omeagle lets you choose male, female, or any gender preference for random video matching.',
    h1: 'Video Chat with Gender Filter — Free Matching',
    heroSub: 'Filter random video matches by gender preference. Free 1-on-1 cam chat with zero coins or subscription fees.',
    badgeText: 'Free Gender Filter Included',
    targetKeyword: 'omegle alternative with gender filter',
    features: [
      { icon: Heart, title: 'Gender Preference Matching', desc: 'Select male, female, or any preferred match directly in settings.' },
      { icon: Sparkles, title: '100% Free Gender Filter', desc: 'No VIP subscription or coin purchases required to enable filters.' },
      { icon: Zap, title: 'Fast WebRTC Connection', desc: 'Connect to live webcam streams in less than 2 seconds.' },
      { icon: Lock, title: 'No Account Required', desc: 'Start matching immediately without sign up.' }
    ],
    faqs: [
      { q: 'Is the gender filter on Omeagle free?', a: 'Yes, unlike other apps that charge for gender filters, Omeagle includes it 100% free.' }
    ]
  },
  'ai-video-chat': {
    title: 'AI Video Chat with Strangers — Smart AI Matching Platform 2026',
    metaDesc: 'Experience AI-powered random video chat on Omeagle. Smart matching algorithms and real-time AI moderation connect you safely with strangers.',
    h1: 'AI Video Chat with Strangers — Smart Matching',
    heroSub: 'Powered by next-gen AI algorithms for instant interest matching, real-time safety moderation, and seamless video quality.',
    badgeText: '🤖 Smart AI Engine 2026',
    targetKeyword: 'ai video chat with strangers',
    features: [
      { icon: Sparkles, title: 'Smart AI Matchmaking', desc: 'AI analyzes interest tags to pair you with like-minded strangers instantly.' },
      { icon: Shield, title: 'Real-Time AI Safety Guard', desc: 'Computer vision algorithms filter out abusive content before it reaches your screen.' },
      { icon: Zap, title: 'Adaptive Video Bitrate', desc: 'AI dynamically optimizes video quality based on your network connection.' },
      { icon: Lock, title: 'Private & Encrypted', desc: 'Zero data logging or AI training on your private video streams.' }
    ],
    faqs: [
      { q: 'How does AI video chat work on Omeagle?', a: 'AI powers our matchmaking queue and real-time safety filters to ensure high quality and safety.' }
    ]
  }
};

export const LandingPageVariant: React.FC<LandingPageVariantProps> = ({ onStartChat, onlineCount }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const currentSlug = (slug || 'omegle-alternative-no-login').toLowerCase().replace(/^\//, '');
  const config = PAGE_CONFIGS[currentSlug] || generateDynamicConfig(currentSlug);

  usePageMeta(config.title, config.metaDesc);

  // Dynamically insert JSON-LD WebApplication and FAQ schema into head
  React.useEffect(() => {
    const webAppSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': `Omeagle — ${config.h1}`,
      'url': `https://omeagle.online/${currentSlug}`,
      'description': config.metaDesc,
      'applicationCategory': 'CommunicationApplication',
      'operatingSystem': 'All (Web Browser)',
      'offers': { '@type': 'Offer', 'price': '0.00', 'priceCurrency': 'USD' }
    };

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': config.faqs.map(f => ({
        '@type': 'Question',
        'name': f.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
      }))
    };

    const scriptApp = document.createElement('script');
    scriptApp.type = 'application/ld+json';
    scriptApp.id = `schema-app-${currentSlug}`;
    scriptApp.innerHTML = JSON.stringify(webAppSchema);

    const scriptFaq = document.createElement('script');
    scriptFaq.type = 'application/ld+json';
    scriptFaq.id = `schema-faq-${currentSlug}`;
    scriptFaq.innerHTML = JSON.stringify(faqSchema);

    document.head.appendChild(scriptApp);
    document.head.appendChild(scriptFaq);

    return () => {
      document.getElementById(`schema-app-${currentSlug}`)?.remove();
      document.getElementById(`schema-faq-${currentSlug}`)?.remove();
    };
  }, [currentSlug, config]);

  return (
    <div className="landing-page variant-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} /> <span>{config.badgeText}</span>
          </div>
          <h1 className="hero-title">{config.h1}</h1>
          <p className="hero-subtitle">{config.heroSub}</p>

          <div className="cta-group">
            <button className="btn-primary-lg" onClick={() => onStartChat('video')}>
              <Video size={22} />
              <span>Start Free Video Chat</span>
            </button>
            <button className="btn-secondary-lg" onClick={() => onStartChat('text')}>
              <MessageSquare size={22} />
              <span>Start Text Chat</span>
            </button>
          </div>

          <div className="online-badge">
            <span className="pulse-dot-green"></span>
            <span><strong>{onlineCount.toLocaleString()}</strong> users online right now</span>
          </div>
        </div>
      </section>

      <section className="seo-content">
        <div className="seo-inner">
          <h2 className="seo-title">Why Choose Omeagle for {config.targetKeyword}?</h2>
          <div className="features-grid">
            {config.features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div key={idx} className="feature-card">
                  <div className="feature-icon"><IconComp size={24} /></div>
                  <h3 className="feature-title">{feat.title}</h3>
                  <p className="feature-desc">{feat.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="seo-block mt-8">
            <h3>Instant Anonymous Stranger Matching</h3>
            <p>
              Omeagle is built for users searching for <strong>{config.targetKeyword}</strong>. Our browser-based WebRTC engine pairs you one-on-one with strangers without collecting emails or personal information. 
            </p>
            <p>
              Whether you want to meet new friends, talk about common hobbies, or practice speaking a new language, Omeagle offers a fast, clean, and safe platform available 24/7 on desktop and mobile browsers.
            </p>
          </div>

          <div className="faq-section mt-10">
            <h2 className="seo-title flex items-center gap-2">
              <HelpCircle size={22} /> Frequently Asked Questions
            </h2>
            <div className="faq-grid">
              {config.faqs.map((faq, idx) => (
                <div key={idx} className="faq-item card p-4 rounded-xl border mb-4">
                  <h4 className="font-bold text-lg mb-2">{faq.q}</h4>
                  <p className="text-muted leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="cta-bottom-box mt-10 p-8 rounded-2xl bg-gradient text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to Start Chatting?</h3>
            <p className="mb-6 opacity-90">Join thousands of people online right now. No signup required.</p>
            <button className="btn-primary-lg mx-auto" onClick={() => onStartChat('video')}>
              <Video size={20} />
              <span>Connect Now Free</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
