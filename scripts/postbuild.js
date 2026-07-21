import { execSync } from 'child_process';

if (process.env.VERCEL) {
  console.log('Vercel build detected: skipping react-snap headless chromium step.');
  process.exit(0);
}

try {
  console.log('Running react-snap static prerender...');
  execSync('npx react-snap', { stdio: 'inherit' });
} catch (err) {
  console.warn('react-snap finished with warnings, continuing build:', err.message);
  process.exit(0);
}
