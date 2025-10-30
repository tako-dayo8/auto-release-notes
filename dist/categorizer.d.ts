/**
 * Change categorizer
 */
import type { CategorizedChanges, ParsedCommit, PullRequest } from './types';
/**
 * Create empty categorized changes
 */
export declare function createEmptyCategories(): CategorizedChanges;
/**
 * Categorize commits into change categories
 */
export declare function categorizeCommits(commits: ParsedCommit[]): CategorizedChanges;
/**
 * Categorize pull requests into change categories
 */
export declare function categorizePullRequests(prs: PullRequest[]): CategorizedChanges;
/**
 * Merge two categorized changes
 */
export declare function mergeCategories(a: CategorizedChanges, b: CategorizedChanges): CategorizedChanges;
/**
 * Get statistics of categorized changes
 */
export declare function getCategoryStats(categories: CategorizedChanges): Record<string, number>;
/**
 * Log category statistics
 */
export declare function logCategoryStats(categories: CategorizedChanges): void;
