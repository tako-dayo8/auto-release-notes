/**
 * Filter for excluding commits and PRs
 */
import type { ParsedCommit, PullRequest } from './types';
/**
 * Check if commit is a chore commit
 */
export declare function isChoreCommit(commit: ParsedCommit): boolean;
/**
 * Check if commit is a merge commit
 */
export declare function isMergeCommit(commit: ParsedCommit): boolean;
/**
 * Filter out chore commits
 */
export declare function filterChoreCommits(commits: ParsedCommit[]): ParsedCommit[];
/**
 * Filter out merge commits
 */
export declare function filterMergeCommits(commits: ParsedCommit[]): ParsedCommit[];
/**
 * Check if PR has any of the exclude labels
 */
export declare function hasExcludeLabel(pr: PullRequest, excludeLabels: string[]): boolean;
/**
 * Filter out PRs with exclude labels
 */
export declare function filterPRsByLabels(prs: PullRequest[], excludeLabels: string[]): PullRequest[];
/**
 * Apply all filters to commits
 */
export declare function applyCommitFilters(commits: ParsedCommit[], options?: {
    excludeChore?: boolean;
    excludeMerge?: boolean;
}): ParsedCommit[];
/**
 * Apply all filters to PRs
 */
export declare function applyPRFilters(prs: PullRequest[], excludeLabels: string[]): PullRequest[];
