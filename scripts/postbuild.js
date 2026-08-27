import { execSync } from 'child_process';

try {
  console.log('Generating Enterprise Multi-Sitemap Architecture and updating robots.txt...');
  execSync('node scripts/generate-sitemaps.js', { stdio: 'inherit' });
} catch (err) {
  console.warn('Sitemap generation finished with notice:', err.message);
}

if (!process.env.VERCEL) {
  try {
    console.log('Running react-snap static prerender...');
    execSync('npx react-snap', { stdio: 'inherit' });
  } catch (err) {
    console.warn('react-snap finished with warnings, continuing build:', err.message);
  }
} else {
  console.log('Vercel build detected: skipping react-snap headless chromium step.');
}

try {
  console.log('Triggering automated search engine pings & IndexNow...');
  execSync('node scripts/ping-sitemap.js', { stdio: 'inherit' });
} catch (err) {
  console.warn('Search engine ping completed with notice:', err.message);
}
