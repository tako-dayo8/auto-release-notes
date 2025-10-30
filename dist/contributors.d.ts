/**
 * Contributors management
 */
import type { ParsedCommit, PullRequest } from './types';
/**
 * Check if username is a bot account
 */
export declare function isBotAccount(username: string): boolean;
/**
 * Extract contributors from commits
 */
export declare function extractContributorsFromCommits(commits: ParsedCommit[]): string[];
/**
 * Extract contributors from PRs
 */
export declare function extractContributorsFromPRs(prs: PullRequest[]): string[];
/**
 * Merge and deduplicate contributors from multiple sources
 */
export declare function mergeContributors(...contributorLists: string[][]): string[];
/**
 * Get contributor count by username
 */
export declare function getContributorStats(commits: ParsedCommit[], prs: PullRequest[]): Map<string, {
    commits: number;
    prs: number;
}>;
/**
 * Format contributors list
 */
export declare function formatContributors(contributors: string[]): string;
