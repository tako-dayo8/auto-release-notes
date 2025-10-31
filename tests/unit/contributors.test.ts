/**
 * Unit tests for contributors management
 */

import {
  isBotAccount,
  extractContributorsFromCommits,
  extractContributorsFromPRs,
  mergeContributors,
  getContributorStats,
  formatContributors,
} from '../../src/contributors';
import type { ParsedCommit, PullRequest } from '../../src/types';

describe('isBotAccount', () => {
  test('detects dependabot', () => {
    expect(isBotAccount('dependabot[bot]')).toBe(true);
  });

  test('detects renovate', () => {
    expect(isBotAccount('renovate[bot]')).toBe(true);
  });

  test('detects github-actions', () => {
    expect(isBotAccount('github-actions[bot]')).toBe(true);
  });

  test('detects greenkeeper', () => {
    expect(isBotAccount('greenkeeper[bot]')).toBe(true);
  });

  test('detects snyk-bot', () => {
    expect(isBotAccount('snyk-bot')).toBe(true);
  });

  test('detects codecov-io', () => {
    expect(isBotAccount('codecov-io')).toBe(true);
  });

  test('is case insensitive', () => {
    expect(isBotAccount('DEPENDABOT[BOT]')).toBe(true);
    expect(isBotAccount('Renovate[bot]')).toBe(true);
  });

  test('returns false for regular users', () => {
    expect(isBotAccount('alice')).toBe(false);
    expect(isBotAccount('bob123')).toBe(false);
    expect(isBotAccount('user-name')).toBe(false);
  });
});

describe('extractContributorsFromCommits', () => {
  test('extracts unique contributors', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'feat',
        subject: 'feature',
        body: '',
        breaking: false,
        hash: 'a',
        author: 'alice',
        date: new Date(),
      },
      {
        type: 'fix',
        subject: 'fix',
        body: '',
        breaking: false,
        hash: 'b',
        author: 'bob',
        date: new Date(),
      },
      {
        type: 'docs',
        subject: 'docs',
        body: '',
        breaking: false,
        hash: 'c',
        author: 'alice',
        date: new Date(),
      },
    ];

    const result = extractContributorsFromCommits(commits);
    expect(result).toHaveLength(2);
    expect(result).toContain('alice');
    expect(result).toContain('bob');
  });

  test('excludes bot accounts', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'feat',
        subject: 'feature',
        body: '',
        breaking: false,
        hash: 'a',
        author: 'alice',
        date: new Date(),
      },
      {
        type: 'chore',
        subject: 'update deps',
        body: '',
        breaking: false,
        hash: 'b',
        author: 'dependabot[bot]',
        date: new Date(),
      },
    ];

    const result = extractContributorsFromCommits(commits);
    expect(result).toHaveLength(1);
    expect(result).toContain('alice');
    expect(result).not.toContain('dependabot[bot]');
  });

  test('excludes unknown authors', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'feat',
        subject: 'feature',
        body: '',
        breaking: false,
        hash: 'a',
        author: 'alice',
        date: new Date(),
      },
      {
        type: 'fix',
        subject: 'fix',
        body: '',
        breaking: false,
        hash: 'b',
        author: 'unknown',
        date: new Date(),
      },
    ];

    const result = extractContributorsFromCommits(commits);
    expect(result).toHaveLength(1);
    expect(result).toContain('alice');
  });

  test('handles empty array', () => {
    const result = extractContributorsFromCommits([]);
    expect(result).toHaveLength(0);
  });
});

describe('extractContributorsFromPRs', () => {
  test('extracts unique contributors', () => {
    const prs: PullRequest[] = [
      {
        number: 1,
        title: 'PR 1',
        body: '',
        author: 'alice',
        labels: [],
        mergedAt: new Date(),
        closedIssues: [],
      },
      {
        number: 2,
        title: 'PR 2',
        body: '',
        author: 'bob',
        labels: [],
        mergedAt: new Date(),
        closedIssues: [],
      },
      {
        number: 3,
        title: 'PR 3',
        body: '',
        author: 'alice',
        labels: [],
        mergedAt: new Date(),
        closedIssues: [],
      },
    ];

    const result = extractContributorsFromPRs(prs);
    expect(result).toHaveLength(2);
    expect(result).toContain('alice');
    expect(result).toContain('bob');
  });

  test('excludes bot accounts', () => {
    const prs: PullRequest[] = [
      {
        number: 1,
        title: 'PR 1',
        body: '',
        author: 'alice',
        labels: [],
        mergedAt: new Date(),
        closedIssues: [],
      },
      {
        number: 2,
        title: 'Update deps',
        body: '',
        author: 'renovate[bot]',
        labels: [],
        mergedAt: new Date(),
        closedIssues: [],
      },
    ];

    const result = extractContributorsFromPRs(prs);
    expect(result).toHaveLength(1);
    expect(result).toContain('alice');
  });

  test('handles empty array', () => {
    const result = extractContributorsFromPRs([]);
    expect(result).toHaveLength(0);
  });
});

describe('mergeContributors', () => {
  test('merges multiple contributor lists', () => {
    const list1 = ['alice', 'bob'];
    const list2 = ['charlie', 'alice'];
    const list3 = ['bob', 'david'];

    const result = mergeContributors(list1, list2, list3);
    expect(result).toHaveLength(4);
    expect(result).toContain('alice');
    expect(result).toContain('bob');
    expect(result).toContain('charlie');
    expect(result).toContain('david');
  });

  test('sorts contributors alphabetically', () => {
    const list1 = ['charlie', 'alice', 'bob'];

    const result = mergeContributors(list1);
    expect(result).toEqual(['alice', 'bob', 'charlie']);
  });

  test('is case insensitive when sorting', () => {
    const list1 = ['Charlie', 'alice', 'Bob'];

    const result = mergeContributors(list1);
    expect(result[0].toLowerCase()).toBe('alice');
    expect(result[1].toLowerCase()).toBe('bob');
    expect(result[2].toLowerCase()).toBe('charlie');
  });

  test('excludes bot accounts', () => {
    const list1 = ['alice', 'dependabot[bot]', 'bob'];

    const result = mergeContributors(list1);
    expect(result).toHaveLength(2);
    expect(result).toContain('alice');
    expect(result).toContain('bob');
  });

  test('excludes unknown contributors', () => {
    const list1 = ['alice', 'unknown', 'bob'];

    const result = mergeContributors(list1);
    expect(result).toHaveLength(2);
    expect(result).toContain('alice');
    expect(result).toContain('bob');
  });

  test('handles empty lists', () => {
    const result = mergeContributors([], [], []);
    expect(result).toHaveLength(0);
  });

  test('filters out empty strings and nulls', () => {
    const list1 = ['alice', '', 'bob'];

    const result = mergeContributors(list1);
    expect(result).toHaveLength(2);
  });
});

describe('getContributorStats', () => {
  test('counts commits per contributor', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'feat',
        subject: 'f1',
        body: '',
        breaking: false,
        hash: 'a',
        author: 'alice',
        date: new Date(),
      },
      {
        type: 'feat',
        subject: 'f2',
        body: '',
        breaking: false,
        hash: 'b',
        author: 'alice',
        date: new Date(),
      },
      {
        type: 'fix',
        subject: 'fix',
        body: '',
        breaking: false,
        hash: 'c',
        author: 'bob',
        date: new Date(),
      },
    ];

    const stats = getContributorStats(commits, []);
    expect(stats.get('alice')?.commits).toBe(2);
    expect(stats.get('bob')?.commits).toBe(1);
  });

  test('counts PRs per contributor', () => {
    const prs: PullRequest[] = [
      {
        number: 1,
        title: 'PR 1',
        body: '',
        author: 'alice',
        labels: [],
        mergedAt: new Date(),
        closedIssues: [],
      },
      {
        number: 2,
        title: 'PR 2',
        body: '',
        author: 'bob',
        labels: [],
        mergedAt: new Date(),
        closedIssues: [],
      },
      {
        number: 3,
        title: 'PR 3',
        body: '',
        author: 'alice',
        labels: [],
        mergedAt: new Date(),
        closedIssues: [],
      },
    ];

    const stats = getContributorStats([], prs);
    expect(stats.get('alice')?.prs).toBe(2);
    expect(stats.get('bob')?.prs).toBe(1);
  });

  test('combines commit and PR counts', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'feat',
        subject: 'f1',
        body: '',
        breaking: false,
        hash: 'a',
        author: 'alice',
        date: new Date(),
      },
    ];

    const prs: PullRequest[] = [
      {
        number: 1,
        title: 'PR 1',
        body: '',
        author: 'alice',
        labels: [],
        mergedAt: new Date(),
        closedIssues: [],
      },
    ];

    const stats = getContributorStats(commits, prs);
    expect(stats.get('alice')?.commits).toBe(1);
    expect(stats.get('alice')?.prs).toBe(1);
  });

  test('excludes bot accounts', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'chore',
        subject: 'update',
        body: '',
        breaking: false,
        hash: 'a',
        author: 'dependabot[bot]',
        date: new Date(),
      },
    ];

    const stats = getContributorStats(commits, []);
    expect(stats.has('dependabot[bot]')).toBe(false);
  });
});

describe('formatContributors', () => {
  test('formats contributors with @ prefix', () => {
    const contributors = ['alice', 'bob', 'charlie'];
    const result = formatContributors(contributors);
    expect(result).toBe('@alice, @bob, @charlie');
  });

  test('handles single contributor', () => {
    const contributors = ['alice'];
    const result = formatContributors(contributors);
    expect(result).toBe('@alice');
  });

  test('returns empty string for empty array', () => {
    const result = formatContributors([]);
    expect(result).toBe('');
  });

  test('preserves order', () => {
    const contributors = ['charlie', 'alice', 'bob'];
    const result = formatContributors(contributors);
    expect(result).toBe('@charlie, @alice, @bob');
  });
});
