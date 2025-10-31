/**
 * Unit tests for filter functions
 */

import {
  isChoreCommit,
  isMergeCommit,
  filterChoreCommits,
  filterMergeCommits,
  hasExcludeLabel,
  filterPRsByLabels,
  applyCommitFilters,
  applyPRFilters,
} from '../../src/filter';
import type { ParsedCommit, PullRequest } from '../../src/types';

// Mock @actions/core
jest.mock('@actions/core');

describe('isChoreCommit', () => {
  test('detects chore commits', () => {
    const commit: ParsedCommit = {
      type: 'chore',
      subject: 'chore: update dependencies',
      body: '',
      breaking: false,
      hash: 'abc',
      author: 'test',
      date: new Date(),
    };
    expect(isChoreCommit(commit)).toBe(true);
  });

  test('detects chore commits with scope', () => {
    const commit: ParsedCommit = {
      type: 'chore',
      subject: 'chore(deps): update packages',
      body: '',
      breaking: false,
      hash: 'abc',
      author: 'test',
      date: new Date(),
    };
    expect(isChoreCommit(commit)).toBe(true);
  });

  test('is case insensitive', () => {
    const commit: ParsedCommit = {
      type: 'chore',
      subject: 'CHORE: update',
      body: '',
      breaking: false,
      hash: 'abc',
      author: 'test',
      date: new Date(),
    };
    expect(isChoreCommit(commit)).toBe(true);
  });

  test('returns false for non-chore commits', () => {
    const commit: ParsedCommit = {
      type: 'feat',
      subject: 'feat: add feature',
      body: '',
      breaking: false,
      hash: 'abc',
      author: 'test',
      date: new Date(),
    };
    expect(isChoreCommit(commit)).toBe(false);
  });
});

describe('isMergeCommit', () => {
  test('detects merge branch commits', () => {
    const commit: ParsedCommit = {
      type: '',
      subject: 'Merge branch main into feature',
      body: '',
      breaking: false,
      hash: 'abc',
      author: 'test',
      date: new Date(),
    };
    expect(isMergeCommit(commit)).toBe(true);
  });

  test('detects merge pull request commits', () => {
    const commit: ParsedCommit = {
      type: '',
      subject: 'Merge pull request #123 from user/branch',
      body: '',
      breaking: false,
      hash: 'abc',
      author: 'test',
      date: new Date(),
    };
    expect(isMergeCommit(commit)).toBe(true);
  });

  test('is case insensitive', () => {
    const commit: ParsedCommit = {
      type: '',
      subject: 'MERGE BRANCH main',
      body: '',
      breaking: false,
      hash: 'abc',
      author: 'test',
      date: new Date(),
    };
    expect(isMergeCommit(commit)).toBe(true);
  });

  test('returns false for regular commits', () => {
    const commit: ParsedCommit = {
      type: 'feat',
      subject: 'feat: add feature',
      body: '',
      breaking: false,
      hash: 'abc',
      author: 'test',
      date: new Date(),
    };
    expect(isMergeCommit(commit)).toBe(false);
  });
});

describe('filterChoreCommits', () => {
  test('filters out chore commits', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'feat',
        subject: 'feat: feature',
        body: '',
        breaking: false,
        hash: 'a',
        author: 'test',
        date: new Date(),
      },
      {
        type: 'chore',
        subject: 'chore: update deps',
        body: '',
        breaking: false,
        hash: 'b',
        author: 'test',
        date: new Date(),
      },
    ];

    const result = filterChoreCommits(commits);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('feat');
  });

  test('returns all commits if no chores', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'feat',
        subject: 'feat: feature',
        body: '',
        breaking: false,
        hash: 'a',
        author: 'test',
        date: new Date(),
      },
    ];

    const result = filterChoreCommits(commits);
    expect(result).toHaveLength(1);
  });

  test('handles empty array', () => {
    const result = filterChoreCommits([]);
    expect(result).toHaveLength(0);
  });
});

describe('filterMergeCommits', () => {
  test('filters out merge commits', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'feat',
        subject: 'feat: feature',
        body: '',
        breaking: false,
        hash: 'a',
        author: 'test',
        date: new Date(),
      },
      {
        type: '',
        subject: 'Merge branch main',
        body: '',
        breaking: false,
        hash: 'b',
        author: 'test',
        date: new Date(),
      },
    ];

    const result = filterMergeCommits(commits);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('feat');
  });
});

describe('hasExcludeLabel', () => {
  test('detects exclude label', () => {
    const pr: PullRequest = {
      number: 1,
      title: 'Test PR',
      body: '',
      author: 'test',
      labels: ['skip-changelog'],
      mergedAt: new Date(),
      closedIssues: [],
    };

    expect(hasExcludeLabel(pr, ['skip-changelog'])).toBe(true);
  });

  test('is case insensitive', () => {
    const pr: PullRequest = {
      number: 1,
      title: 'Test PR',
      body: '',
      author: 'test',
      labels: ['SKIP-CHANGELOG'],
      mergedAt: new Date(),
      closedIssues: [],
    };

    expect(hasExcludeLabel(pr, ['skip-changelog'])).toBe(true);
  });

  test('returns false when no exclude labels', () => {
    const pr: PullRequest = {
      number: 1,
      title: 'Test PR',
      body: '',
      author: 'test',
      labels: ['feature'],
      mergedAt: new Date(),
      closedIssues: [],
    };

    expect(hasExcludeLabel(pr, ['skip-changelog'])).toBe(false);
  });

  test('handles multiple exclude labels', () => {
    const pr: PullRequest = {
      number: 1,
      title: 'Test PR',
      body: '',
      author: 'test',
      labels: ['no-changelog'],
      mergedAt: new Date(),
      closedIssues: [],
    };

    expect(hasExcludeLabel(pr, ['skip-changelog', 'no-changelog'])).toBe(true);
  });
});

describe('filterPRsByLabels', () => {
  test('filters PRs with exclude labels', () => {
    const prs: PullRequest[] = [
      {
        number: 1,
        title: 'PR 1',
        body: '',
        author: 'test',
        labels: ['feature'],
        mergedAt: new Date(),
        closedIssues: [],
      },
      {
        number: 2,
        title: 'PR 2',
        body: '',
        author: 'test',
        labels: ['skip-changelog'],
        mergedAt: new Date(),
        closedIssues: [],
      },
    ];

    const result = filterPRsByLabels(prs, ['skip-changelog']);
    expect(result).toHaveLength(1);
    expect(result[0].number).toBe(1);
  });

  test('returns all PRs when no exclude labels', () => {
    const prs: PullRequest[] = [
      {
        number: 1,
        title: 'PR 1',
        body: '',
        author: 'test',
        labels: ['feature'],
        mergedAt: new Date(),
        closedIssues: [],
      },
    ];

    const result = filterPRsByLabels(prs, []);
    expect(result).toHaveLength(1);
  });
});

describe('applyCommitFilters', () => {
  test('applies chore filter by default', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'feat',
        subject: 'feat: feature',
        body: '',
        breaking: false,
        hash: 'a',
        author: 'test',
        date: new Date(),
      },
      {
        type: 'chore',
        subject: 'chore: update',
        body: '',
        breaking: false,
        hash: 'b',
        author: 'test',
        date: new Date(),
      },
    ];

    const result = applyCommitFilters(commits);
    expect(result).toHaveLength(1);
  });

  test('applies merge filter when enabled', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'feat',
        subject: 'feat: feature',
        body: '',
        breaking: false,
        hash: 'a',
        author: 'test',
        date: new Date(),
      },
      {
        type: '',
        subject: 'Merge branch main',
        body: '',
        breaking: false,
        hash: 'b',
        author: 'test',
        date: new Date(),
      },
    ];

    const result = applyCommitFilters(commits, { excludeMerge: true });
    expect(result).toHaveLength(1);
  });

  test('can disable chore filter', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'chore',
        subject: 'chore: update',
        body: '',
        breaking: false,
        hash: 'a',
        author: 'test',
        date: new Date(),
      },
    ];

    const result = applyCommitFilters(commits, { excludeChore: false });
    expect(result).toHaveLength(1);
  });
});

describe('applyPRFilters', () => {
  test('applies PR label filters', () => {
    const prs: PullRequest[] = [
      {
        number: 1,
        title: 'PR 1',
        body: '',
        author: 'test',
        labels: ['feature'],
        mergedAt: new Date(),
        closedIssues: [],
      },
      {
        number: 2,
        title: 'PR 2',
        body: '',
        author: 'test',
        labels: ['skip-changelog'],
        mergedAt: new Date(),
        closedIssues: [],
      },
    ];

    const result = applyPRFilters(prs, ['skip-changelog']);
    expect(result).toHaveLength(1);
  });
});
