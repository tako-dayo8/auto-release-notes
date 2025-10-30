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
export declare const CATEGORY_DISPLAY: Record<string, CategoryDisplay>;
//# sourceMappingURL=base.d.ts.map