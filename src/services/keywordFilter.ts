/**
 * Keyword filter for chat messages.
 * Checks text against a list of blocked keywords/patterns.
 */

const DEFAULT_BLOCKED = [
  // Inappropriate content patterns
  /\b(nsfw|onlyfans|porn|xxx|sex cam|cam girl|cam boy)\b/i,
  /\b(send nudes|nude pic|naked pic)\b/i,
  /\b(whatsapp|telegram|instagram|snapchat|discord)\s*(me|link|id|\/)/i,
  /\b(give me your|what(?:'s| is) your)\s*(phone|number|address|email|real name)\b/i,
  /\b(meet me|come to my|go to)\s*(house|home|place|room)\b/i,
];

export function isBlocked(text: string, customKeywords: string[] = []): boolean {
  const lower = text.toLowerCase();

  // Check default patterns
  for (const pattern of DEFAULT_BLOCKED) {
    if (pattern.test(text)) return true;
  }

  // Check custom keywords
  for (const kw of customKeywords) {
    if (kw && lower.includes(kw.toLowerCase())) return true;
  }

  return false;
}

export function filterMessage(text: string, customKeywords: string[] = []): { allowed: boolean; reason?: string } {
  if (isBlocked(text, customKeywords)) {
    return { allowed: false, reason: 'Message contains blocked content' };
  }
  return { allowed: true };
}
