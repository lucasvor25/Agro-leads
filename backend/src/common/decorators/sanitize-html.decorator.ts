import { Transform, TransformFnParams } from 'class-transformer';
import * as sanitizeHtml from 'sanitize-html';

export function SanitizeHtml(options?: sanitizeHtml.IOptions) {
  return Transform((params: TransformFnParams) => {
    if (typeof params.value !== 'string') {
      return params.value;
    }

    const defaultOptions: sanitizeHtml.IOptions = {
      allowedTags: [], // Remove all tags by default
      allowedAttributes: {}, // Remove all attributes
    };

    return sanitizeHtml(params.value, options || defaultOptions);
  });
}
