/**
 * Filter for excluding commits and PRs
 */

import * as core from '@actions/core';
import type { ParsedCommit, PullRequest } from './types';

/**
 * Check if commit is a chore commit
 */
export function isChoreCommit(commit: ParsedCommit): boolean {
  return /^chore(\(.*?\))?:/i.test(commit.subject);
}

/**
 * Check if commit is a merge commit
 */
export function isMergeCommit(commit: ParsedCommit): boolean {
  return /^merge (branch|pull request)/i.test(commit.subject);
}

/**
 * Filter out chore commits
 */
export function filterChoreCommits(commits: ParsedCommit[]): ParsedCommit[] {
  const filtered = commits.filter((commit) => !isChoreCommit(commit));
  const excluded = commits.length - filtered.length;

  if (excluded > 0) {
    core.info(`Excluding ${excluded} chore commits`);
  }

  return filtered;
}

/**
 * Filter out merge commits
 */
export function filterMergeCommits(commits: ParsedCommit[]): ParsedCommit[] {
  const filtered = commits.filter((commit) => !isMergeCommit(commit));
  const excluded = commits.length - filtered.length;

  if (excluded > 0) {
    core.info(`Excluding ${excluded} merge commits`);
  }

  return filtered;
}

/**
 * Check if PR has any of the exclude labels
 */
export function hasExcludeLabel(pr: PullRequest, excludeLabels: string[]): boolean {
  return pr.labels.some((label) =>
    excludeLabels.some((exclude) => label.toLowerCase() === exclude.toLowerCase())
  );
}

/**
 * Filter out PRs with exclude labels
 */
export function filterPRsByLabels(prs: PullRequest[], excludeLabels: string[]): PullRequest[] {
  if (excludeLabels.length === 0) {
    return prs;
  }

  const filtered = prs.filter((pr) => !hasExcludeLabel(pr, excludeLabels));
  const excluded = prs.length - filtered.length;

  if (excluded > 0) {
    core.info(`Excluding ${excluded} PRs with labels: ${excludeLabels.join(', ')}`);
  }

  return filtered;
}

/**
 * Apply all filters to commits
 */
export function applyCommitFilters(
  commits: ParsedCommit[],
  options: {
    excludeChore?: boolean;
    excludeMerge?: boolean;
  } = {}
): ParsedCommit[] {
  let filtered = commits;

  if (options.excludeChore !== false) {
    filtered = filterChoreCommits(filtered);
  }

  if (options.excludeMerge === true) {
    filtered = filterMergeCommits(filtered);
  }

  return filtered;
}

/**
 * Apply all filters to PRs
 */
export function applyPRFilters(prs: PullRequest[], excludeLabels: string[]): PullRequest[] {
  return filterPRsByLabels(prs, excludeLabels);
}
