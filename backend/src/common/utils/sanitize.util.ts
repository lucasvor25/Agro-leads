import * as sanitizeHtml from 'sanitize-html';

/**
 * Remove tags HTML maliciosas de strings para proteger contra XSS.
 * Uso: chame sanitizeString(value) nos campos de texto livre dos DTOs.
 */
export function sanitizeString(value: string | undefined | null): string {
  if (!value || typeof value !== 'string') return value as string;
  
  const cleanValue = sanitizeHtml(value, {
    allowedTags: [], // Remove todas as tags
    allowedAttributes: {}, // Remove atributos
  });

  return cleanValue.trim();
}
