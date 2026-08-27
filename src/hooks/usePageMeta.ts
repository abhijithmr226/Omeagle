import { useEffect } from 'react';

export interface PageMetaOptions {
  title?: string;
  description?: string;
  canonicalPath?: string;
  lang?: string;
  faqs?: Array<{ q: string; a: string }>;
  keywords?: string[];
  breadcrumbs?: Array<{ name: string; url: string }>;
}

const SUPPORTED_LANGUAGES = ['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'ne', 'si'];

/**
 * Sets document.title, meta descriptions, canonical URLs, hreflang alternates,
 * and structured JSON-LD schemas dynamically per-route for maximum SEO & AI Search dominance.
 */
export function usePageMeta(title: string, description: string, options?: PageMetaOptions) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // 2. Update or create meta description
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;

    // 3. Update OG Tags
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = title;
    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = description;

    // 4. Update Twitter Tags
    const twTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
    if (twTitle) twTitle.content = title;
    const twDesc = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
    if (twDesc) twDesc.content = description;

    // 5. Dynamic Canonical Link
    const cleanPath = options?.canonicalPath || window.location.pathname;
    const fullCanonicalUrl = `https://www.omeagle.online${cleanPath === '/' ? '' : cleanPath}`;
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = fullCanonicalUrl;

    // 6. Dynamic Hreflang Alternates
    const hreflangElements: HTMLLinkElement[] = [];
    const baseSlug = cleanPath.replace(/^\/(hi|bn|ta|te|mr|gu|kn|ml|pa|ur|ne|si)\/?/, '');
    
    // Default x-default and English
    const xDefault = document.createElement('link');
    xDefault.rel = 'alternate';
    xDefault.hreflang = 'x-default';
    xDefault.href = `https://www.omeagle.online/${baseSlug}`;
    document.head.appendChild(xDefault);
    hreflangElements.push(xDefault);

    SUPPORTED_LANGUAGES.forEach(langCode => {
      const altLink = document.createElement('link');
      altLink.rel = 'alternate';
      altLink.hreflang = `${langCode}-IN`;
      altLink.href = `https://www.omeagle.online/${langCode}/${baseSlug}`;
      document.head.appendChild(altLink);
      hreflangElements.push(altLink);
    });

    // 7. Inject Unified JSON-LD Schema Graph
    const schemaGraph: any = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://www.omeagle.online/#organization',
          'name': 'Omeagle',
          'url': 'https://www.omeagle.online',
          'logo': {
            '@type': 'ImageObject',
            '@id': 'https://www.omeagle.online/#logo',
            'url': 'https://www.omeagle.online/headerlogo.png',
            'caption': 'Omeagle Free Video Chat'
          }
        },
        {
          '@type': 'WebSite',
          '@id': 'https://www.omeagle.online/#website',
          'url': 'https://www.omeagle.online',
          'name': 'Omeagle Online',
          'publisher': { '@id': 'https://www.omeagle.online/#organization' }
        },
        {
          '@type': 'SoftwareApplication',
          '@id': `${fullCanonicalUrl}#app`,
          'name': title,
          'url': fullCanonicalUrl,
          'applicationCategory': 'CommunicationApplication',
          'operatingSystem': 'All (Web Browser, iOS, Android, Windows, macOS)',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD'
          },
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '4.85',
            'reviewCount': '18490',
            'bestRating': '5',
            'worstRating': '1'
          }
        }
      ]
    };

    // Append FAQ Schema if provided
    if (options?.faqs && options.faqs.length > 0) {
      schemaGraph['@graph'].push({
        '@type': 'FAQPage',
        '@id': `${fullCanonicalUrl}#faq`,
        'mainEntity': options.faqs.map(f => ({
          '@type': 'Question',
          'name': f.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.a
          }
        }))
      });
    }

    // Append Breadcrumbs Schema
    if (options?.breadcrumbs && options.breadcrumbs.length > 0) {
      schemaGraph['@graph'].push({
        '@type': 'BreadcrumbList',
        '@id': `${fullCanonicalUrl}#breadcrumbs`,
        'itemListElement': options.breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          'position': i + 1,
          'name': b.name,
          'item': b.url
        }))
      });
    }

    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.id = 'dynamic-page-schema';
    scriptTag.innerHTML = JSON.stringify(schemaGraph);
    document.head.appendChild(scriptTag);

    // Cleanup when route changes
    return () => {
      document.title = 'Omeagle — Free Video Chat with Strangers | Omegle Alternative 2026';
      if (metaDesc) {
        metaDesc.content = 'Free random video chat and text chat with strangers. No sign up, no registration required. The best Omegle alternative with AI moderation, gender & country filters.';
      }
      hreflangElements.forEach(el => el.remove());
      scriptTag.remove();
    };
  }, [title, description, JSON.stringify(options)]);
}
