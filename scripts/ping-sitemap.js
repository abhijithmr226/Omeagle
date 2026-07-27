import https from 'https';

const HOST = 'omeagle.online';
const INDEXNOW_KEY = 'e4d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0';
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;

const URL_LIST = [
  `https://${HOST}/`,
  `https://${HOST}/omegle-alternative-no-login`,
  `https://${HOST}/random-video-chat-no-signup`,
  `https://${HOST}/talk-to-strangers-free`,
  `https://${HOST}/anonymous-video-chat-no-signup`,
  `https://${HOST}/chat/india`,
  `https://${HOST}/ometv-alternative`,
  `https://${HOST}/free-stranger-video-chat`,
  `https://${HOST}/gender-filter-video-chat`,
  `https://${HOST}/mobile-video-chat`,
  `https://${HOST}/free-girl-video-chat`,
  `https://${HOST}/unblocked-video-chat`,
  `https://${HOST}/100-percent-free-video-chat`,
  `https://${HOST}/chat-usa`,
  `https://${HOST}/chat-uk`,
  `https://${HOST}/emerald-chat-alternative`,
  `https://${HOST}/joingy-alternative`,
  `https://${HOST}/coomeet-alternative`,
  `https://${HOST}/chatroulette-alternative`,
  `https://${HOST}/monkey-app-alternative`,
  `https://${HOST}/ai-video-chat`,
  `https://${HOST}/no-download-video-chat`,
  `https://${HOST}/live-webcam-chat`,
  `https://${HOST}/webcam-chat-strangers`,
  `https://${HOST}/blog`,
  `https://${HOST}/blog/is-omegle-still-available`,
  `https://${HOST}/blog/what-replaced-omegle`,
  `https://${HOST}/blog/is-random-video-chat-safe`,
  `https://${HOST}/blog/how-to-talk-to-strangers-online`,
  `https://${HOST}/blog/best-video-chat-sites-for-india`,
  `https://${HOST}/blog/anonymous-video-chat-guide`,
  `https://${HOST}/blog/how-to-meet-people-online-safely`,
  `https://${HOST}/blog/10-free-random-video-chat-websites`,
  `https://${HOST}/blog/safe-random-chat-apps`,
  `https://${HOST}/blog/chat-with-strangers-free`,
  `https://${HOST}/blog/omeagle-free-random-video-chat`,
  `https://${HOST}/blog/best-omegle-alternatives`,
  `https://${HOST}/blog/safe-video-chat-guide`,
  `https://${HOST}/blog/ometv-alternative`,
  `https://${HOST}/blog/no-signup-video-chat`,
  `https://${HOST}/blog/text-chat-with-strangers`,
  `https://${HOST}/safety`,
  `https://${HOST}/about`,
  `https://${HOST}/contact`,
  `https://${HOST}/privacy`,
  `https://${HOST}/terms`
];

async function pingIndexNow() {
  console.log('🚀 Pinging IndexNow protocol (Bing, Yandex, Seznam, Naver)...');
  const payload = JSON.stringify({
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: URL_LIST
  });

  const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log(`✅ IndexNow response code: ${res.statusCode}`);
      resolve();
    });

    req.on('error', (err) => {
      console.warn('⚠️ IndexNow ping warning:', err.message);
      resolve();
    });

    req.write(payload);
    req.end();
  });
}

async function pingSitemap(targetUrl) {
  console.log(`📡 Pinging search engine: ${targetUrl}`);
  return new Promise((resolve) => {
    https.get(targetUrl, (res) => {
      console.log(`✅ Response code: ${res.statusCode}`);
      resolve();
    }).on('error', (err) => {
      console.warn('⚠️ Search engine ping warning:', err.message);
      resolve();
    });
  });
}

async function runPings() {
  console.log('==================================================');
  console.log('🔍 Starting Automated Search Engine Indexing Pings');
  console.log('==================================================');

  await pingIndexNow();
  await pingSitemap(`https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`);
  await pingSitemap(`https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`);

  console.log('✨ All search engine indexing notifications completed.');
}

runPings().catch((err) => console.error('Ping script error:', err));
