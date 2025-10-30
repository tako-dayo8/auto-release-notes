/**
 * Conventional Commits parser
 */

import parser from 'conventional-commits-parser';
import type { ParsedCommit } from './types';

/**
 * Parse a commit message using Conventional Commits format
 */
export function parseCommit(commit: ParsedCommit): ParsedCommit {
  try {
    const parsed = parser.sync(commit.subject + '\n\n' + (commit.body || ''));

    return {
      ...commit,
      type: parsed.type || '',
      scope: parsed.scope || undefined,
      subject: parsed.subject || commit.subject,
      body: parsed.body || commit.body,
      breaking:
        parsed.notes?.some((note) => note.title === 'BREAKING CHANGE') ||
        commit.subject.includes('!:') ||
        false,
    };
  } catch (error) {
    // If parsing fails, return the original commit
    return commit;
  }
}

/**
 * Parse multiple commits
 */
export function parseCommits(commits: ParsedCommit[]): ParsedCommit[] {
  return commits.map(parseCommit);
}

/**
 * Extract type from PR title using Conventional Commits format
 */
export function extractTypeFromPRTitle(title: string): string | null {
  const match = title.match(/^(\w+)(?:\([\w-]+\))?:/);
  return match ? match[1] : null;
}

/**
 * Check if commit message matches Conventional Commits format
 */
export function isConventionalCommit(message: string): boolean {
  const conventionalRegex = /^(\w+)(?:\([\w-]+\))?!?:\s.+/;
  return conventionalRegex.test(message);
}
