/**
 * Template factory
 */

import { Template } from './base';
import { StandardTemplate } from './standard';
import { DetailedTemplate } from './detailed';
import { MinimalTemplate } from './minimal';

export { Template };
export * from './standard';
export * from './detailed';
export * from './minimal';

/**
 * Get template by name
 */
export function getTemplate(name: string): Template {
  switch (name.toLowerCase()) {
    case 'standard':
      return new StandardTemplate();
    case 'detailed':
      return new DetailedTemplate();
    case 'minimal':
      return new MinimalTemplate();
    default:
      throw new Error(
        `Unknown template: ${name}. Available templates: standard, detailed, minimal`
      );
  }
}

/**
 * Get list of available template names
 */
export function getAvailableTemplates(): string[] {
  return ['standard', 'detailed', 'minimal'];
}
