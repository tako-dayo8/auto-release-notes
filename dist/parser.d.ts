/**
 * Conventional Commits parser
 */
import type { ParsedCommit } from './types';
/**
 * Parse a commit message using Conventional Commits format
 */
export declare function parseCommit(commit: ParsedCommit): ParsedCommit;
/**
 * Parse multiple commits
 */
export declare function parseCommits(commits: ParsedCommit[]): ParsedCommit[];
/**
 * Extract type from PR title using Conventional Commits format
 */
export declare function extractTypeFromPRTitle(title: string): string | null;
/**
 * Check if commit message matches Conventional Commits format
 */
export declare function isConventionalCommit(message: string): boolean;
