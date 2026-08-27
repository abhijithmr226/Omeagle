import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.omeagle.online';
const TODAY = new Date().toISOString().split('T')[0];

const LANGUAGES = ['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'ne', 'si', 'ar'];

const CORE_ROUTES = [
  '',
  'blog',
  'safety',
  'about',
  'contact',
  'privacy',
  'terms',
  'omegle-alternative-no-login',
  'random-video-chat-no-signup',
  'talk-to-strangers-free',
  'anonymous-video-chat-no-signup',
  'chat/india',
  'ometv-alternative',
  'free-stranger-video-chat',
  'gender-filter-video-chat',
  'mobile-video-chat',
  'ai-video-chat'
];

const COMPARISONS = [
  'ometv-vs-omeagle',
  'monkey-app-vs-omeagle',
  'emerald-chat-vs-omeagle',
  'chitchat-vs-omeagle',
  'uhmegle-vs-omeagle',
  'thundr-vs-omeagle',
  'bazoocam-vs-omeagle',
  'chatrandom-vs-omeagle',
  'coomeet-vs-omeagle',
  'omegle-web-vs-omeagle',
  'shagle-vs-omeagle',
  'camfrog-vs-omeagle'
];

const INDIAN_CITIES = [
  'delhi', 'mumbai', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad',
  'jaipur', 'lucknow', 'patna', 'chandigarh', 'kochi', 'indore', 'surat', 'nagpur',
  'bhopal', 'visakhapatnam', 'coimbatore', 'varanasi', 'guwahati', 'bhubaneswar',
  'ludhiana', 'amritsar', 'agra', 'dehradun', 'goa', 'vadodara', 'rajkot', 'kanpur',
  'nashik', 'faridabad', 'ghaziabad', 'meerut', 'noida', 'gurgaon', 'jamshedpur', 'mangalore'
];

const SOUTH_ASIAN_CITIES = [
  // Nepal
  'kathmandu', 'pokhara', 'lalitpur', 'biratnagar', 'bharatpur', 'birgunj', 'dharan', 'butwal',
  // Sri Lanka
  'colombo', 'kandy', 'galle', 'jaffna', 'negombo', 'gampaha', 'trincomalee', 'batticaloa',
  // Bangladesh
  'dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barisal', 'rangpur', 'comilla',
  // Pakistan
  'karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'gujranwala', 'quetta',
  // Middle East & SEA
  'dubai', 'abu-dhabi', 'doha', 'riyadh', 'singapore', 'kuala-lumpur'
];

const BLOG_SLUGS = [
  'anonymous-video-chat-guide',
  'how-to-meet-people-online-safely',
  '10-free-random-video-chat-websites',
  'safe-random-chat-apps',
  'chat-with-strangers-free',
  'omegle-alternative-india-guide',
  'webrtc-video-chat-safety',
  'anjaan-logo-se-video-call-baat-kaise-kare',
  'bina-registration-online-text-chat',
  'online-dost-kaise-banaye-videshi-friends',
  'live-webcam-chat-strangers-free'
];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function buildXmlUrlSet(urls) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const item of urls) {
    xml += `  <url>\n`;
    xml += `    <loc>${item.loc}</loc>\n`;
    xml += `    <lastmod>${item.lastmod || TODAY}</lastmod>\n`;
    xml += `    <changefreq>${item.changefreq || 'daily'}</changefreq>\n`;
    xml += `    <priority>${item.priority || '0.80'}</priority>\n`;
    xml += `  </url>\n`;
  }
  xml += `</urlset>\n`;
  return xml;
}

const sitemapsDir = path.resolve(__dirname, '../public/sitemaps');
ensureDir(sitemapsDir);

// 1. Core Sitemap
const coreUrls = CORE_ROUTES.map(route => ({
  loc: route ? `${BASE_URL}/${route}` : `${BASE_URL}/`,
  priority: route === '' ? '1.0' : '0.90',
  changefreq: 'daily'
}));
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-core.xml'), buildXmlUrlSet(coreUrls));

// 2. Multilingual Sitemap
const langUrls = [];
LANGUAGES.forEach(lang => {
  langUrls.push({ loc: `${BASE_URL}/${lang}`, priority: '0.95', changefreq: 'daily' });
  langUrls.push({ loc: `${BASE_URL}/${lang}/omegle-alternative`, priority: '0.90', changefreq: 'daily' });
  langUrls.push({ loc: `${BASE_URL}/${lang}/random-video-chat`, priority: '0.90', changefreq: 'daily' });
  langUrls.push({ loc: `${BASE_URL}/${lang}/stranger-chat`, priority: '0.85', changefreq: 'daily' });
  langUrls.push({ loc: `${BASE_URL}/${lang}/anonymous-chat`, priority: '0.85', changefreq: 'daily' });
  langUrls.push({ loc: `${BASE_URL}/${lang}/online-friendship`, priority: '0.80', changefreq: 'daily' });
});
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-languages.xml'), buildXmlUrlSet(langUrls));

// 3. Competitor Comparisons Sitemap
const compUrls = COMPARISONS.map(slug => ({
  loc: `${BASE_URL}/compare/${slug}`,
  priority: '0.88',
  changefreq: 'weekly'
}));
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-comparisons.xml'), buildXmlUrlSet(compUrls));

// 4. Indian Cities Sitemap
const indiaCityUrls = [];
INDIAN_CITIES.forEach(city => {
  indiaCityUrls.push({ loc: `${BASE_URL}/random-video-chat-${city}`, priority: '0.85', changefreq: 'daily' });
  indiaCityUrls.push({ loc: `${BASE_URL}/talk-to-strangers-${city}`, priority: '0.80', changefreq: 'daily' });
  indiaCityUrls.push({ loc: `${BASE_URL}/omegle-alternative-${city}`, priority: '0.85', changefreq: 'daily' });
});
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-cities-india.xml'), buildXmlUrlSet(indiaCityUrls));

// 5. South Asian & Global Cities Sitemap
const southAsiaCityUrls = [];
SOUTH_ASIAN_CITIES.forEach(city => {
  southAsiaCityUrls.push({ loc: `${BASE_URL}/random-video-chat-${city}`, priority: '0.85', changefreq: 'daily' });
  southAsiaCityUrls.push({ loc: `${BASE_URL}/talk-to-strangers-${city}`, priority: '0.80', changefreq: 'daily' });
  southAsiaCityUrls.push({ loc: `${BASE_URL}/omegle-alternative-${city}`, priority: '0.85', changefreq: 'daily' });
});
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-cities-southasia.xml'), buildXmlUrlSet(southAsiaCityUrls));

// 6. Blog Sitemap
const blogUrls = BLOG_SLUGS.map(slug => ({
  loc: `${BASE_URL}/blog/${slug}`,
  priority: '0.80',
  changefreq: 'weekly'
}));
fs.writeFileSync(path.join(sitemapsDir, 'sitemap-blog.xml'), buildXmlUrlSet(blogUrls));

// 7. Sitemap Index XML
const sitemapIndexFiles = [
  'sitemap-core.xml',
  'sitemap-languages.xml',
  'sitemap-comparisons.xml',
  'sitemap-cities-india.xml',
  'sitemap-cities-southasia.xml',
  'sitemap-blog.xml'
];

let indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
indexXml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (const file of sitemapIndexFiles) {
  indexXml += `  <sitemap>\n`;
  indexXml += `    <loc>${BASE_URL}/sitemaps/${file}</loc>\n`;
  indexXml += `    <lastmod>${TODAY}</lastmod>\n`;
  indexXml += `  </sitemap>\n`;
}
indexXml += `</sitemapindex>\n`;

fs.writeFileSync(path.resolve(__dirname, '../public/sitemap-index.xml'), indexXml);

// Also generate consolidated master public/sitemap.xml
const allCombinedUrls = [...coreUrls, ...langUrls, ...compUrls, ...indiaCityUrls.slice(0, 50), ...southAsiaCityUrls.slice(0, 30), ...blogUrls];
fs.writeFileSync(path.resolve(__dirname, '../public/sitemap.xml'), buildXmlUrlSet(allCombinedUrls));

// 8. Update Robots.txt
const robotsTxt = `User-agent: *
Allow: /
Allow: /hi
Allow: /bn
Allow: /ta
Allow: /te
Allow: /mr
Allow: /gu
Allow: /kn
Allow: /ml
Allow: /pa
Allow: /ur
Allow: /ne
Allow: /si
Allow: /compare/
Allow: /tag/
Allow: /sitemaps/

Disallow: /api/
Disallow: /admin/
Disallow: /*?*session_id=

# AI Search Crawlers Explicit Access (Google AI Overviews, ChatGPT Search, Perplexity, Claude)
User-agent: Google-Extended
Allow: /
User-agent: GPTBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: CCBot
Allow: /

Sitemap: https://www.omeagle.online/sitemap-index.xml
Sitemap: https://www.omeagle.online/sitemap.xml
`;

fs.writeFileSync(path.resolve(__dirname, '../public/robots.txt'), robotsTxt);

console.log(`✅ Generated Multi-Sitemap Architecture with ${allCombinedUrls.length} master routes!`);
console.log(`✅ Generated sitemap-index.xml, sitemaps/*, sitemap.xml, and updated robots.txt`);
