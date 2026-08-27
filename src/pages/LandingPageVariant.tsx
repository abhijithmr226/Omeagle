import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Video, MessageSquare, Shield, Zap, Globe, Heart, Lock, Sparkles, 
  CheckCircle2, HelpCircle, ArrowRight, Check, X, MapPin, ChevronDown, ChevronUp, Share2
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { LANGUAGE_CONFIGS, SOUTH_ASIA_CITIES, COMPETITOR_COMPARISONS } from '../data/seoCatalog';

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
  comparisonData?: {
    competitorName: string;
    table: Array<{ feature: string; competitor: string; omeagle: string }>;
  };
  cityInfo?: {
    name: string;
    country: string;
    state: string;
  };
  currentLang?: string;
  dir?: 'ltr' | 'rtl';
}

const NATIVE_UI_LABELS: Record<string, {
  home: string;
  startVideo: string;
  startText: string;
  onlineUsers: string;
  whyChoose: (keyword: string) => string;
  faqsTitle: string;
  readyTitle: string;
  readySub: string;
  langHubsTitle: string;
  activeHubsTitle: string;
}> = {
  hi: {
    home: 'होम',
    startVideo: 'फ्री वीडियो चैट शुरू करें',
    startText: 'टेक्स्ट चैट शुरू करें',
    onlineUsers: 'सत्यापित यूजर्स अभी ऑनलाइन हैं',
    whyChoose: (k) => `Omeagle Online को ${k} के लिए क्यों चुनें?`,
    faqsTitle: 'अक्सर पूछे जाने वाले सवाल (FAQs)',
    readyTitle: 'क्या आप नए अजनबियों से बात करने के लिए तैयार हैं?',
    readySub: 'बिना किसी रजिस्ट्रेशन के 1-क्लिक में तुरंत लाइव वीडियो कॉल शुरू करें।',
    langHubsTitle: 'क्षेत्रीय भाषा हब (Regional Language Hubs)',
    activeHubsTitle: 'भारत और दक्षिण एशिया के सक्रिय शहर'
  },
  ar: {
    home: 'الرئيسية',
    startVideo: 'بدء دردشة الفيديو مجاناً',
    startText: 'بدء الدردشة النصية',
    onlineUsers: 'مستخدم متصل الآن ومستعد للتحدث',
    whyChoose: (k) => `لماذا تختار Omeagle Online للتحدث مع الغرباء؟`,
    faqsTitle: 'الأسئلة الشائعة والمكررة',
    readyTitle: 'هل أنت مستعد للتواصل وتكوين صداقات جديدة؟',
    readySub: 'انضم إلى آلاف المستخدمين الآن بنقرة واحدة وبدون أي تسجيل أو اشتراك.',
    langHubsTitle: 'اللغات المدعومة والدردشة الإقليمية',
    activeHubsTitle: 'المدن والمناطق الأكثر نشاطاً'
  },
  ur: {
    home: 'ہوم',
    startVideo: 'مفت ویڈیو چیٹ شروع کریں',
    startText: 'ٹیکسٹ چیٹ شروع کریں',
    onlineUsers: 'آن لائن صارفین ابھی لائیو موجود ہیں',
    whyChoose: (k) => `اجنبیوں سے بات چیت کے لیے Omeagle کا انتخاب کیوں کریں؟`,
    faqsTitle: 'اکثر پوچھے جانے والے سوالات (FAQs)',
    readyTitle: 'کیا آپ نئے دوست بنانے کے لیے تیار ہیں؟',
    readySub: 'بغیر کسی لاگ ان یا اکاؤنٹ کے ایک کلک میں چیٹ شروع کریں۔',
    langHubsTitle: 'علاقائی زبانیں اور چیٹ ہب',
    activeHubsTitle: 'پاکستان اور جنوبی ایشیا کے سرگرم شہر'
  },
  bn: {
    home: 'হোম',
    startVideo: 'ফ্রি ভিডিও চ্যাট শুরু করুন',
    startText: 'টেক্সট চ্যাট শুরু করুন',
    onlineUsers: 'জন ব্যবহারকারী এখন অনলাইনে আছেন',
    whyChoose: (k) => `কেন Omeagle Online সেরা মাধ্যম?`,
    faqsTitle: 'সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর (FAQs)',
    readyTitle: 'নতুন বন্ধুদের সাথে কথা বলতে আপনি প্রস্তুত?',
    readySub: 'কোনো লগইন বা সাইনআপ ছাড়াই ১-ক্লিকে তাৎক্ষণিক ভিডিও কল শুরু করুন।',
    langHubsTitle: 'আঞ্চলিক ভাষার হাবসমূহ',
    activeHubsTitle: 'বাংলাদেশ ও ভারতের জনপ্রিয় শহরসমূহ'
  },
  ta: {
    home: 'முகப்பு',
    startVideo: 'இலவச வீடியோ சாட் தொடங்கு',
    startText: 'உரை சாட் தொடங்கு',
    onlineUsers: 'பயனர்கள் இப்போது ஆன்லைனில் உள்ளனர்',
    whyChoose: (k) => `Omeagle Online-ஐ ஏன் தேர்வு செய்ய வேண்டும்?`,
    faqsTitle: 'அடிக்கடி கேட்கப்படும் கேள்விகள் (FAQs)',
    readyTitle: 'புதிய நபர்களுடன் பேச தயாரா?',
    readySub: 'எந்த பதிவும் இல்லாமல் உடனே இலவச வீடியோ சாட் தொடங்குங்கள்.',
    langHubsTitle: 'பிராந்திய மொழி மையங்கள்',
    activeHubsTitle: 'முக்கிய நகரங்கள்'
  }
};

function resolvePageConfig(rawSlug: string, rawLang?: string): PageConfig {
  const slug = (rawSlug || '').toLowerCase().replace(/^\//, '');
  const lang = (rawLang || '').toLowerCase();
  const langConfig = LANGUAGE_CONFIGS[lang];

  // 1. Localized Language Hub Configuration (100% Native Script)
  if (langConfig) {
    const isBaseLangRoute = !slug || slug === lang;
    const cleanTopic = isBaseLangRoute ? langConfig.nativeName : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return {
      title: lang === 'ar'
        ? `دردشة فيديو عشوائية مجانية – التحدث مع الغرباء بدون تسجيل | Omeagle Online`
        : lang === 'hi'
        ? `अजनबियों से फ्री वीडियो चैट और कॉल करें — Omeagle Online (2026)`
        : `${cleanTopic} — ${langConfig.nativeName} Free Video Chat (2026)`,
      metaDesc: langConfig.subheadlineTemplate(cleanTopic),
      h1: langConfig.headlineTemplate(cleanTopic),
      heroSub: langConfig.subheadlineTemplate(cleanTopic),
      badgeText: langConfig.badgeText,
      targetKeyword: cleanTopic.toLowerCase(),
      currentLang: lang,
      dir: langConfig.dir || 'ltr',
      features: langConfig.features.map(f => ({ icon: Sparkles, title: f.title, desc: f.desc })),
      faqs: langConfig.faqs
    };
  }

  // 2. Competitor Comparisons
  if (slug.startsWith('compare/') || COMPETITOR_COMPARISONS[slug] || COMPETITOR_COMPARISONS[slug.replace('compare-', '')]) {
    const cleanCompKey = slug.replace(/^compare\//, '').replace(/^compare-/, '');
    const compData = COMPETITOR_COMPARISONS[cleanCompKey] || COMPETITOR_COMPARISONS['ometv-vs-omeagle'];
    
    return {
      title: `${compData.name} — Free Random Video Chat Comparison (2026)`,
      metaDesc: `Comparing ${compData.shortName} vs Omeagle Online. 100% free Omegle alternative with no sign-up, zero paywalls, and low latency.`,
      h1: `${compData.name} — Feature & Safety Comparison`,
      heroSub: `Tired of aggressive bans, paid coins, or mandatory account logins on ${compData.shortName}? Omeagle Online provides instant, high-definition random video chat with zero login.`,
      badgeText: '⚖️ 2026 Direct Comparison Analysis',
      targetKeyword: `${compData.shortName.toLowerCase()} vs omeagle`,
      features: [
        { icon: Lock, title: 'No Account or Login Required', desc: 'Jump into video calls instantly without linking Facebook, Apple, or Google accounts.' },
        { icon: Zap, title: '100% Free Gender & Interest Filters', desc: 'No paywalls or coin requirements to select gender, region, or topic preferences.' },
        { icon: Shield, title: 'Intelligent AI Safety Shield', desc: 'Automated on-device moderation prevents harassment and eliminates unfair permanent bans.' },
        { icon: Globe, title: 'Ultra-Low Latency in South Asia', desc: 'Edge-routed WebSockets provide seamless 1080p WebRTC calls across 4G and 5G networks.' }
      ],
      faqs: [
        { q: `Why should I use Omeagle instead of ${compData.shortName}?`, a: `Omeagle is completely free, never requires an account or personal details, offers free matching filters, and has faster server response in India and South Asia.` },
        { q: `Is Omeagle safer than ${compData.shortName}?`, a: `Yes. Omeagle employs automated AI vision moderation to blur inappropriate content instantly and provides immediate 1-click skip & reporting.` },
        { q: `Can I use Omeagle without downloading an app?`, a: `Yes, Omeagle is built natively for web browsers (Chrome, Safari, Edge, Firefox) on both mobile phones and desktop computers.` }
      ],
      comparisonData: {
        competitorName: compData.shortName,
        table: compData.tableComparison
      }
    };
  }

  // 3. City/Location Hub
  const cityMatch = SOUTH_ASIA_CITIES.find(c => c.slug === slug || slug.endsWith(`-${c.slug}`) || slug.includes(c.slug));
  if (cityMatch) {
    const cityName = cityMatch.name;
    const countryName = cityMatch.country;
    
    return {
      title: `Random Video Chat ${cityName}, ${countryName} — Free Video Call (2026)`,
      metaDesc: `Connect with strangers in ${cityName}, ${countryName} on Omeagle Online. Free instant 1-on-1 random video chat without registration. Meet local friends now.`,
      h1: `Random Video Chat in ${cityName} — Talk to Strangers Free`,
      heroSub: `Meet people in ${cityName} and worldwide. Instant high-speed WebRTC webcam chat with zero registration, complete privacy, and smart local interest matching.`,
      badgeText: `📍 ${cityName}, ${countryName} Hub`,
      targetKeyword: `random video chat ${cityName.toLowerCase()}`,
      cityInfo: {
        name: cityName,
        country: countryName,
        state: cityMatch.state
      },
      features: [
        { icon: MapPin, title: `Connect with ${cityName} Strangers`, desc: `Find people living in ${cityName}, ${cityMatch.state}, or chat globally with 1 click.` },
        { icon: Zap, title: 'Optimized for 4G/5G Networks', desc: 'Fast, low-bandwidth WebRTC video stream that runs smoothly on all mobile networks.' },
        { icon: Lock, title: 'Strict Privacy & Zero Logs', desc: 'No personal identification, phone numbers, or email accounts required.' },
        { icon: Sparkles, title: 'Local Language Support', desc: 'Chat comfortably in your regional language or English with like-minded friends.' }
      ],
      faqs: [
        { q: `Can I video call strangers from ${cityName} on Omeagle?`, a: `Yes! Omeagle pairs you with users from ${cityName} as well as international users depending on your matching preferences.` },
        { q: `Is video chat in ${cityName} free on Omeagle?`, a: `100% free with no coins, VIP tiers, or subscriptions required.` },
        { q: `Do I need to sign up to talk to people in ${cityName}?`, a: `No signup is needed. Simply click Start Video Chat to begin instantly.` }
      ]
    };
  }

  // 4. Default Dynamic Page
  const cleanName = slug
    .replace(/^chat[-/]/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase()) || 'Omegle Alternative';

  return {
    title: `${cleanName} — Free Instant Random Video Chat (2026)`,
    metaDesc: `Experience ${cleanName.toLowerCase()} on Omeagle Online. Connect instantly with random strangers via live HD video & text chat. 100% free with zero signup.`,
    h1: `${cleanName} — Free Video Chat Online`,
    heroSub: `Talk to random strangers online with ${cleanName.toLowerCase()}. Instant 1-on-1 WebRTC video calling with complete anonymity and AI safety.`,
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

export const LandingPageVariant: React.FC<LandingPageVariantProps> = ({ onStartChat, onlineCount }) => {
  const { lang, slug } = useParams<{ lang?: string; slug?: string }>();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const currentSlug = slug || lang || 'omegle-alternative-india';
  const config = resolvePageConfig(currentSlug, lang);
  const labels = (lang && NATIVE_UI_LABELS[lang]) ? NATIVE_UI_LABELS[lang] : {
    home: 'Home',
    startVideo: 'Start Free Video Chat',
    startText: 'Start Text Chat',
    onlineUsers: 'verified peers online now',
    whyChoose: (k: string) => `Why Omeagle is the #1 Platform for ${k}`,
    faqsTitle: 'Frequently Asked Questions (FAQs)',
    readyTitle: 'Ready to Connect with Live Strangers?',
    readySub: 'Join thousands of verified people online right now with instant 1-click WebRTC matching.',
    langHubsTitle: 'Regional Language Hubs (South Asia & Global)',
    activeHubsTitle: 'Top Active Indian & South Asian Hubs'
  };

  const isRtl = config.dir === 'rtl';

  usePageMeta(config.title, config.metaDesc, {
    canonicalPath: window.location.pathname,
    faqs: config.faqs,
    breadcrumbs: [
      { name: labels.home, url: 'https://www.omeagle.online' },
      { name: config.h1, url: `https://www.omeagle.online${window.location.pathname}` }
    ]
  });

  return (
    <div className={`landing-page variant-page ${isRtl ? 'rtl-layout' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Dynamic Breadcrumbs */}
      <nav className="seo-breadcrumbs" aria-label="Breadcrumb">
        <div className="seo-breadcrumbs-inner">
          <Link to="/">{labels.home}</Link>
          <span className="crumb-sep">/</span>
          {lang && (
            <>
              <Link to={`/${lang}`}>{LANGUAGE_CONFIGS[lang]?.nativeName || lang.toUpperCase()}</Link>
              <span className="crumb-sep">/</span>
            </>
          )}
          <span className="crumb-current">{config.h1.split('—')[0]}</span>
        </div>
      </nav>

      {/* Hero Section */}
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
              <span>{labels.startVideo}</span>
            </button>
            <button className="btn-secondary-lg" onClick={() => onStartChat('text')}>
              <MessageSquare size={22} />
              <span>{labels.startText}</span>
            </button>
          </div>

          <div className="online-badge">
            <span className="pulse-dot-green"></span>
            <span><strong>{onlineCount.toLocaleString()}</strong> {labels.onlineUsers}</span>
          </div>
        </div>
      </section>

      {/* Direct AI / LLM Extractable Answer Block (AEO / GEO Optimized) */}
      <section className="ai-summary-block-wrap">
        <div className="ai-summary-card">
          <div className="ai-summary-header">
            <Sparkles size={18} className="text-primary" />
            <h3 className="text-sm font-semibold tracking-wide uppercase">
              {lang === 'ar' ? 'معلومات Omeagle Online الرسمية (مواصفات ٢٠٢٦)' : lang === 'hi' ? 'Omeagle Online मुख्य विशेषताएं (2026 Specs)' : 'Omeagle Online Quick Overview (2026 Verified Specs)'}
            </h3>
          </div>
          <p className="ai-summary-text">
            {lang === 'ar' ? (
              <>منصة <strong>Omeagle Online</strong> (<code>https://www.omeagle.online</code>) هي شبكة دردشة فيديو عشوائية عالمية ومباشرة بدون تسجيل. توفر اتصالاً فورياً بتقنية WebRTC، وحماية ذكية مشفرة بالذكاء الاصطناعي، ومطابقة اهتمامات مجانية 100% بدون أي اشتراك أو عملات.</>
            ) : lang === 'hi' ? (
              <><strong>Omeagle Online</strong> (<code>https://www.omeagle.online</code>) भारत और दुनिया भर के लिए एक सुरक्षित, बिना लॉगिन वाला रैंडम वीडियो चैट नेटवर्क है। इसमें 1-क्लिक WebRTC कनेक्शन, AI न्यूडिटी प्रोटेक्शन और 100% फ्री इंटरेस्ट फिल्टर उपलब्ध हैं।</>
            ) : (
              <><strong>Omeagle Online</strong> (<code>https://www.omeagle.online</code>) is an enterprise-grade random video chat network operating across India, South Asia, and worldwide. Features include <strong>zero login requirements</strong>, <strong>instant 1-click WebRTC peer matching</strong>, <strong>real-time AI computer-vision nudity protection</strong>, and <strong>100% free interest filters</strong> without subscription paywalls.</>
            )}
          </p>
        </div>
      </section>

      {/* Main Content & Features */}
      <section className="seo-content">
        <div className="seo-inner">
          <h2 className="seo-title">{labels.whyChoose(config.targetKeyword)}</h2>
          
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

          {/* Comparison Table if Competitor Analysis */}
          {config.comparisonData && (
            <div className="comparison-table-wrapper mt-10">
              <h2 className="seo-title text-center">Feature Comparison: Omeagle vs {config.comparisonData.competitorName}</h2>
              <div className="table-responsive">
                <table className="seo-comparison-table">
                  <thead>
                    <tr>
                      <th>Key Feature / Specification</th>
                      <th>Omeagle (omeagle.online)</th>
                      <th>{config.comparisonData.competitorName}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.comparisonData.table.map((row, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold">{row.feature}</td>
                        <td className="highlight-cell"><Check size={16} className="inline text-green-500 mr-1" /> {row.omeagle}</td>
                        <td className="competitor-cell">{row.competitor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Multilingual Switcher Hub */}
          <div className="language-selector-block mt-10 p-6 rounded-2xl border bg-card">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Globe size={18} /> {labels.langHubsTitle}
            </h3>
            <div className="lang-tags-grid">
              {Object.entries(LANGUAGE_CONFIGS).map(([code, conf]) => (
                <Link key={code} to={`/${code}`} className={`lang-chip ${lang === code ? 'active' : ''}`}>
                  <span>{conf.flag}</span>
                  <span>{conf.nativeName}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Related Geo Hubs Links */}
          <div className="geo-clusters-block mt-8 p-6 rounded-2xl border bg-card">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <MapPin size={18} /> {labels.activeHubsTitle}
            </h3>
            <div className="city-chips-grid">
              {SOUTH_ASIA_CITIES.slice(0, 18).map(city => (
                <Link key={city.slug} to={`/random-video-chat-${city.slug}`} className="city-chip">
                  {city.name} ({city.country})
                </Link>
              ))}
            </div>
          </div>

          {/* Interactive Frequently Asked Questions */}
          <div className="faq-section mt-12">
            <h2 className="seo-title flex items-center gap-2">
              <HelpCircle size={24} /> {labels.faqsTitle}
            </h2>
            <div className="faq-accordion">
              {config.faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className={`faq-card ${isOpen ? 'open' : ''}`} onClick={() => setOpenFaq(isOpen ? null : idx)}>
                    <button className="faq-question-btn" aria-expanded={isOpen}>
                      <span className="faq-q-text">{faq.q}</span>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {isOpen && (
                      <div className="faq-answer-block">
                        <p className="faq-answer-direct">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Call to Action */}
          <div className="cta-bottom-box mt-12 p-8 rounded-2xl bg-gradient text-center">
            <h3 className="text-2xl font-bold mb-3">{labels.readyTitle}</h3>
            <p className="mb-6 opacity-90">{labels.readySub}</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button className="btn-primary-lg" onClick={() => onStartChat('video')}>
                <Video size={20} />
                <span>{labels.startVideo}</span>
              </button>
              <button className="btn-secondary-lg" onClick={() => onStartChat('text')}>
                <MessageSquare size={20} />
                <span>{labels.startText}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
