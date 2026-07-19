const CACHE = new Map<string, string>();

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!targetLang || targetLang === 'en') return text;
  const cacheKey = `${text}__${targetLang}`;
  if (CACHE.has(cacheKey)) return CACHE.get(cacheKey)!;

  try {
    // MyMemory Translation API — free, no key needed, CORS-friendly
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      CACHE.set(cacheKey, translated);
      return translated;
    }
  } catch {}

  // Fallback: Google Translate (unofficial)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = data[0].map((s: any[]) => s[0]).join('');
    if (translated) {
      CACHE.set(cacheKey, translated);
      return translated;
    }
  } catch {}

  return text;
}
