/**
 * Text formatter for release notes
 */
/**
 * Convert issue numbers (#123) to GitHub links
 */
export declare function linkifyIssues(text: string, owner: string, repo: string): string;
/**
 * Convert PR numbers to GitHub links
 */
export declare function linkifyPRs(text: string, owner: string, repo: string): string;
/**
 * Convert commit hashes to GitHub links
 */
export declare function linkifyCommits(text: string, owner: string, repo: string): string;
/**
 * Escape markdown special characters
 */
export declare function escapeMarkdown(text: string): string;
/**
 * Truncate text to maximum length
 */
export declare function truncate(text: string, maxLength: number): string;
/**
 * Format username with @ prefix
 */
export declare function formatUsername(username: string): string;
/**
 * Convert text to title case
 */
export declare function toTitleCase(text: string): string;
/**
 * Remove duplicate lines from text
 */
export declare function removeDuplicateLines(text: string): string;
