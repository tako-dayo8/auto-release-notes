/**
 * Contributors management
 */

import type { ParsedCommit, PullRequest } from './types';

/**
 * Bot account patterns to exclude
 */
const BOT_PATTERNS = [
  'dependabot[bot]',
  'renovate[bot]',
  'github-actions[bot]',
  'greenkeeper[bot]',
  'snyk-bot',
  'codecov-io',
  'allcontributors[bot]',
];

/**
 * Check if username is a bot account
 */
export function isBotAccount(username: string): boolean {
  const lower = username.toLowerCase();
  return BOT_PATTERNS.some((pattern) => lower.includes(pattern.toLowerCase()));
}

/**
 * Extract contributors from commits
 */
export function extractContributorsFromCommits(commits: ParsedCommit[]): string[] {
  const contributors = new Set<string>();

  for (const commit of commits) {
    if (commit.author && commit.author !== 'unknown' && !isBotAccount(commit.author)) {
      contributors.add(commit.author);
    }
  }

  return Array.from(contributors);
}

/**
 * Extract contributors from PRs
 */
export function extractContributorsFromPRs(prs: PullRequest[]): string[] {
  const contributors = new Set<string>();

  for (const pr of prs) {
    if (pr.author && pr.author !== 'unknown' && !isBotAccount(pr.author)) {
      contributors.add(pr.author);
    }
  }

  return Array.from(contributors);
}

/**
 * Merge and deduplicate contributors from multiple sources
 */
export function mergeContributors(...contributorLists: string[][]): string[] {
  const allContributors = new Set<string>();

  for (const list of contributorLists) {
    for (const contributor of list) {
      if (contributor && contributor !== 'unknown' && !isBotAccount(contributor)) {
        allContributors.add(contributor);
      }
    }
  }

  return Array.from(allContributors).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
}

/**
 * Get contributor count by username
 */
export function getContributorStats(
  commits: ParsedCommit[],
  prs: PullRequest[]
): Map<string, { commits: number; prs: number }> {
  const stats = new Map<string, { commits: number; prs: number }>();

  // Count commits
  for (const commit of commits) {
    if (commit.author && !isBotAccount(commit.author)) {
      const current = stats.get(commit.author) || { commits: 0, prs: 0 };
      current.commits++;
      stats.set(commit.author, current);
    }
  }

  // Count PRs
  for (const pr of prs) {
    if (pr.author && !isBotAccount(pr.author)) {
      const current = stats.get(pr.author) || { commits: 0, prs: 0 };
      current.prs++;
      stats.set(pr.author, current);
    }
  }

  return stats;
}

/**
 * Format contributors list
 */
export function formatContributors(contributors: string[]): string {
  if (contributors.length === 0) {
    return '';
  }

  return contributors.map((c) => `@${c}`).join(', ');
}
