/**
 * Unit tests for change categorizer
 */

import {
  createEmptyCategories,
  categorizeCommits,
  categorizePullRequests,
  mergeCategories,
  getCategoryStats,
  logCategoryStats,
} from '../../src/categorizer';
import type { ParsedCommit, PullRequest, CategorizedChanges } from '../../src/types';

// Mock @actions/core
jest.mock('@actions/core');

describe('createEmptyCategories', () => {
  test('creates empty category structure', () => {
    const categories = createEmptyCategories();

    expect(categories.breaking).toEqual([]);
    expect(categories.features).toEqual([]);
    expect(categories.bugFixes).toEqual([]);
    expect(categories.documentation).toEqual([]);
    expect(categories.performance).toEqual([]);
    expect(categories.refactoring).toEqual([]);
    expect(categories.style).toEqual([]);
    expect(categories.tests).toEqual([]);
    expect(categories.build).toEqual([]);
    expect(categories.ci).toEqual([]);
    expect(categories.other).toEqual([]);
  });

  test('creates new instances', () => {
    const cat1 = createEmptyCategories();
    const cat2 = createEmptyCategories();

    expect(cat1).not.toBe(cat2);
    expect(cat1.features).not.toBe(cat2.features);
  });
});

describe('categorizeCommits', () => {
  test('categorizes feat commits', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'feat',
        subject: 'add new feature',
        body: '',
        breaking: false,
        hash: 'abc123',
        author: 'alice',
        date: new Date(),
      },
    ];

    const result = categorizeCommits(commits);
    expect(result.features).toHaveLength(1);
    expect(result.features[0].description).toBe('add new feature');
    expect(result.features[0].author).toBe('alice');
  });

  test('categorizes fix commits', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'fix',
        subject: 'resolve bug',
        body: '',
        breaking: false,
        hash: 'def456',
        author: 'bob',
        date: new Date(),
      },
    ];

    const result = categorizeCommits(commits);
    expect(result.bugFixes).toHaveLength(1);
    expect(result.bugFixes[0].description).toBe('resolve bug');
  });

  test('categorizes breaking changes with priority', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'feat',
        subject: 'breaking feature',
        body: '',
        breaking: true,
        hash: 'ghi789',
        author: 'charlie',
        date: new Date(),
      },
    ];

    const result = categorizeCommits(commits);
    expect(result.breaking).toHaveLength(1);
    expect(result.features).toHaveLength(0);
  });

  test('categorizes multiple commit types', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'feat',
        subject: 'feature 1',
        body: '',
        breaking: false,
        hash: 'a1',
        author: 'alice',
        date: new Date(),
      },
      {
        type: 'fix',
        subject: 'fix 1',
        body: '',
        breaking: false,
        hash: 'b1',
        author: 'bob',
        date: new Date(),
      },
      {
        type: 'docs',
        subject: 'docs 1',
        body: '',
        breaking: false,
        hash: 'c1',
        author: 'charlie',
        date: new Date(),
      },
    ];

    const result = categorizeCommits(commits);
    expect(result.features).toHaveLength(1);
    expect(result.bugFixes).toHaveLength(1);
    expect(result.documentation).toHaveLength(1);
  });

  test('categorizes all commit types correctly', () => {
    const types = [
      { type: 'feat', category: 'features' },
      { type: 'fix', category: 'bugFixes' },
      { type: 'docs', category: 'documentation' },
      { type: 'style', category: 'style' },
      { type: 'refactor', category: 'refactoring' },
      { type: 'perf', category: 'performance' },
      { type: 'test', category: 'tests' },
      { type: 'build', category: 'build' },
      { type: 'ci', category: 'ci' },
      { type: 'chore', category: 'other' },
    ] as const;

    types.forEach(({ type, category }) => {
      const commits: ParsedCommit[] = [
        {
          type,
          subject: `${type} message`,
          body: '',
          breaking: false,
          hash: 'abc',
          author: 'test',
          date: new Date(),
        },
      ];

      const result = categorizeCommits(commits);
      expect(result[category]).toHaveLength(1);
    });
  });

  test('puts unknown types in other category', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'unknown',
        subject: 'unknown message',
        body: '',
        breaking: false,
        hash: 'xyz',
        author: 'test',
        date: new Date(),
      },
    ];

    const result = categorizeCommits(commits);
    expect(result.other).toHaveLength(1);
  });

  test('handles empty commit array', () => {
    const result = categorizeCommits([]);
    expect(result.features).toHaveLength(0);
    expect(result.bugFixes).toHaveLength(0);
  });

  test('preserves commit hash in change item', () => {
    const commits: ParsedCommit[] = [
      {
        type: 'feat',
        subject: 'test',
        body: '',
        breaking: false,
        hash: 'abc123',
        author: 'test',
        date: new Date(),
      },
    ];

    const result = categorizeCommits(commits);
    expect(result.features[0].commitHash).toBe('abc123');
  });
});

describe('categorizePullRequests', () => {
  test('categorizes PR by feature label', () => {
    const prs: PullRequest[] = [
      {
        number: 123,
        title: 'Add new feature',
        body: '',
        author: 'alice',
        labels: ['feature'],
        mergedAt: new Date(),
        closedIssues: [],
      },
    ];

    const result = categorizePullRequests(prs);
    expect(result.features).toHaveLength(1);
    expect(result.features[0].prNumber).toBe(123);
  });

  test('categorizes PR by bug label', () => {
    const prs: PullRequest[] = [
      {
        number: 456,
        title: 'Fix bug',
        body: '',
        author: 'bob',
        labels: ['bug'],
        mergedAt: new Date(),
        closedIssues: [],
      },
    ];

    const result = categorizePullRequests(prs);
    expect(result.bugFixes).toHaveLength(1);
  });

  test('recognizes enhancement as feature', () => {
    const prs: PullRequest[] = [
      {
        number: 789,
        title: 'Enhance feature',
        body: '',
        author: 'charlie',
        labels: ['enhancement'],
        mergedAt: new Date(),
        closedIssues: [],
      },
    ];

    const result = categorizePullRequests(prs);
    expect(result.features).toHaveLength(1);
  });

  test('prioritizes breaking-change label', () => {
    const prs: PullRequest[] = [
      {
        number: 100,
        title: 'Breaking feature',
        body: '',
        author: 'alice',
        labels: ['breaking-change', 'feature'],
        mergedAt: new Date(),
        closedIssues: [],
      },
    ];

    const result = categorizePullRequests(prs);
    expect(result.breaking).toHaveLength(1);
    expect(result.features).toHaveLength(0);
  });

  test('puts unlabeled PR in other category', () => {
    const prs: PullRequest[] = [
      {
        number: 200,
        title: 'Some change',
        body: '',
        author: 'bob',
        labels: [],
        mergedAt: new Date(),
        closedIssues: [],
      },
    ];

    const result = categorizePullRequests(prs);
    expect(result.other).toHaveLength(1);
  });

  test('handles case-insensitive labels', () => {
    const prs: PullRequest[] = [
      {
        number: 300,
        title: 'Test',
        body: '',
        author: 'test',
        labels: ['Feature', 'BUG', 'Documentation'],
        mergedAt: new Date(),
        closedIssues: [],
      },
    ];

    const result = categorizePullRequests(prs);
    expect(result.features).toHaveLength(1);
  });

  test('includes closed issues in change item', () => {
    const prs: PullRequest[] = [
      {
        number: 400,
        title: 'Fix issue',
        body: 'Closes #100',
        author: 'alice',
        labels: ['bug'],
        mergedAt: new Date(),
        closedIssues: [100, 101],
      },
    ];

    const result = categorizePullRequests(prs);
    expect(result.bugFixes[0].issues).toEqual([100, 101]);
  });

  test('handles empty PR array', () => {
    const result = categorizePullRequests([]);
    expect(result.features).toHaveLength(0);
  });
});

describe('mergeCategories', () => {
  test('merges two empty categories', () => {
    const a = createEmptyCategories();
    const b = createEmptyCategories();

    const result = mergeCategories(a, b);
    expect(result.features).toHaveLength(0);
  });

  test('merges categories with items', () => {
    const a = createEmptyCategories();
    a.features.push({
      type: 'feat',
      description: 'feature A',
      author: 'alice',
      issues: [],
      breaking: false,
    });

    const b = createEmptyCategories();
    b.features.push({
      type: 'feat',
      description: 'feature B',
      author: 'bob',
      issues: [],
      breaking: false,
    });

    const result = mergeCategories(a, b);
    expect(result.features).toHaveLength(2);
    expect(result.features[0].description).toBe('feature A');
    expect(result.features[1].description).toBe('feature B');
  });

  test('preserves order', () => {
    const a = createEmptyCategories();
    a.features.push({
      type: 'feat',
      description: 'first',
      author: 'test',
      issues: [],
      breaking: false,
    });

    const b = createEmptyCategories();
    b.features.push({
      type: 'feat',
      description: 'second',
      author: 'test',
      issues: [],
      breaking: false,
    });

    const result = mergeCategories(a, b);
    expect(result.features[0].description).toBe('first');
    expect(result.features[1].description).toBe('second');
  });

  test('merges all categories', () => {
    const a = createEmptyCategories();
    a.breaking.push({
      type: 'feat',
      description: 'breaking',
      author: 'test',
      issues: [],
      breaking: true,
    });

    const b = createEmptyCategories();
    b.bugFixes.push({
      type: 'fix',
      description: 'fix',
      author: 'test',
      issues: [],
      breaking: false,
    });

    const result = mergeCategories(a, b);
    expect(result.breaking).toHaveLength(1);
    expect(result.bugFixes).toHaveLength(1);
  });
});

describe('getCategoryStats', () => {
  test('returns zero counts for empty categories', () => {
    const categories = createEmptyCategories();
    const stats = getCategoryStats(categories);

    expect(stats['Breaking Changes']).toBe(0);
    expect(stats.Features).toBe(0);
    expect(stats['Bug Fixes']).toBe(0);
  });

  test('counts items in each category', () => {
    const categories = createEmptyCategories();
    categories.features.push(
      {
        type: 'feat',
        description: 'f1',
        author: 'test',
        issues: [],
        breaking: false,
      },
      {
        type: 'feat',
        description: 'f2',
        author: 'test',
        issues: [],
        breaking: false,
      }
    );
    categories.bugFixes.push({
      type: 'fix',
      description: 'fix1',
      author: 'test',
      issues: [],
      breaking: false,
    });

    const stats = getCategoryStats(categories);
    expect(stats.Features).toBe(2);
    expect(stats['Bug Fixes']).toBe(1);
    expect(stats.Documentation).toBe(0);
  });

  test('includes all category names', () => {
    const categories = createEmptyCategories();
    const stats = getCategoryStats(categories);

    const expectedKeys = [
      'Breaking Changes',
      'Features',
      'Bug Fixes',
      'Documentation',
      'Performance',
      'Refactoring',
      'Style',
      'Tests',
      'Build',
      'CI/CD',
      'Other',
    ];

    expectedKeys.forEach((key) => {
      expect(stats).toHaveProperty(key);
    });
  });
});

describe('logCategoryStats', () => {
  test('logs category statistics', () => {
    const categories = createEmptyCategories();
    categories.features.push({
      type: 'feat',
      description: 'feature',
      author: 'test',
      issues: [],
      breaking: false,
    });

    // This function calls core.info, which is mocked
    // We're just testing it doesn't throw
    expect(() => logCategoryStats(categories)).not.toThrow();
  });

  test('handles empty categories', () => {
    const categories = createEmptyCategories();
    expect(() => logCategoryStats(categories)).not.toThrow();
  });
});
