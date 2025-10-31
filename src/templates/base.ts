/**
 * Base template interface
 */

import type { ReleaseData, ChangeItem } from '../types';

export interface Template {
  /**
   * Generate complete release notes
   */
  generate(data: ReleaseData): string;

  /**
   * Format a single change item
   */
  formatChangeItem(item: ChangeItem, owner: string, repo: string): string;

  /**
   * Format a category section
   */
  formatCategory(categoryKey: string, items: ChangeItem[], owner: string, repo: string): string;
}

/**
 * Category display information
 */
export interface CategoryDisplay {
  emoji: string;
  title: string;
}

/**
 * Common category display configuration
 */
export const CATEGORY_DISPLAY: Record<string, CategoryDisplay> = {
  breaking: { emoji: '🚨', title: 'Breaking Changes' },
  features: { emoji: '✨', title: 'Features' },
  bugFixes: { emoji: '🐛', title: 'Bug Fixes' },
  documentation: { emoji: '📚', title: 'Documentation' },
  performance: { emoji: '⚡', title: 'Performance' },
  refactoring: { emoji: '🔧', title: 'Refactoring' },
  style: { emoji: '🎨', title: 'Style' },
  tests: { emoji: '✅', title: 'Tests' },
  build: { emoji: '🔨', title: 'Build System' },
  ci: { emoji: '🤖', title: 'CI/CD' },
  other: { emoji: '📦', title: 'Other Changes' },
};
