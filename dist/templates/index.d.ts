/**
 * Template factory
 */
import { Template } from './base';
export { Template };
export * from './standard';
export * from './detailed';
export * from './minimal';
/**
 * Get template by name
 */
export declare function getTemplate(name: string): Template;
/**
 * Get list of available template names
 */
export declare function getAvailableTemplates(): string[];
//# sourceMappingURL=index.d.ts.map