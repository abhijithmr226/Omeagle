import { useEffect } from 'react';

/**
 * Sets document.title and meta description dynamically per-page.
 * Works with react-snap: the prerendered HTML will capture these
 * values at build time, giving each route its own unique meta tags.
 */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta description
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;

    // Update OG tags
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = title;
    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = description;

    // Update Twitter tags
    const twTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
    if (twTitle) twTitle.content = title;
    const twDesc = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
    if (twDesc) twDesc.content = description;

    // Cleanup: restore defaults when component unmounts (user navigates back to home)
    return () => {
      document.title = 'Omeagle — Free Video Chat with Strangers | No Sign Up | Best Omegle Alternative';
      if (metaDesc) {
        metaDesc.content = 'Free random video chat and text chat with strangers. No sign up, no registration required. The best Omegle alternative with AI moderation, gender & country filters. Start chatting instantly.';
      }
    };
  }, [title, description]);
}
