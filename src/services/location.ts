import { UserLocation } from '../types/chat';

const LOCATION_CACHE_KEY = 'omeagle_user_location';

export async function getUserLocation(): Promise<UserLocation | null> {
  // Check cache first (refresh every 30 min)
  const cached = localStorage.getItem(LOCATION_CACHE_KEY);
  if (cached) {
    const data = JSON.parse(cached);
    if (Date.now() - data.ts < 30 * 60 * 1000) return data.location;
  }

  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 600000,
      });
    });

    // Reverse geocode using free API
    const { latitude, longitude } = pos.coords;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
    );
    const data = await res.json();

    const location: UserLocation = {
      country: data.address?.country || 'Unknown',
      city: data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Unknown',
      countryCode: data.address?.country_code?.toUpperCase() || 'UN',
    };

    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ location, ts: Date.now() }));
    return location;
  } catch {
    return null;
  }
}

export function getCountryFlag(code: string): string {
  if (!code || code === 'UN') return '🌍';
  const base = 127397; // Unicode regional indicator offset
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + base));
}

// Country list for filter dropdown
export const COUNTRIES = [
  { code: '', label: 'All Countries' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'IN', label: 'India' },
  { code: 'BR', label: 'Brazil' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'JP', label: 'Japan' },
  { code: 'KR', label: 'South Korea' },
  { code: 'AU', label: 'Australia' },
  { code: 'CA', label: 'Canada' },
  { code: 'MX', label: 'Mexico' },
  { code: 'ES', label: 'Spain' },
  { code: 'IT', label: 'Italy' },
  { code: 'RU', label: 'Russia' },
  { code: 'CN', label: 'China' },
  { code: 'AR', label: 'Argentina' },
  { code: 'NG', label: 'Nigeria' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'TR', label: 'Turkey' },
];
