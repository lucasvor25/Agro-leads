import * as sanitizeHtml from 'sanitize-html';

export function sanitizeString(value: string | undefined | null): string {
  if (!value || typeof value !== 'string') return value as string;

  const cleanValue = sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  });

  return cleanValue.trim();
}
