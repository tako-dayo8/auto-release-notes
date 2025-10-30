/**
 * Change categorizer
 */

import type { CategorizedChanges, ChangeItem, ParsedCommit, PullRequest } from './types';
import * as core from '@actions/core';

/**
 * Type to category mapping
 */
const TYPE_TO_CATEGORY: Record<string, keyof CategorizedChanges> = {
  feat: 'features',
  fix: 'bugFixes',
  docs: 'documentation',
  style: 'style',
  refactor: 'refactoring',
  perf: 'performance',
  test: 'tests',
  build: 'build',
  ci: 'ci',
  chore: 'other',
};

/**
 * Label to category mapping
 */
const LABEL_TO_CATEGORY: Record<string, keyof CategorizedChanges> = {
  feature: 'features',
  enhancement: 'features',
  bug: 'bugFixes',
  bugfix: 'bugFixes',
  documentation: 'documentation',
  performance: 'performance',
  'breaking-change': 'breaking',
};

/**
 * Create empty categorized changes
 */
export function createEmptyCategories(): CategorizedChanges {
  return {
    breaking: [],
    features: [],
    bugFixes: [],
    documentation: [],
    performance: [],
    refactoring: [],
    style: [],
    tests: [],
    build: [],
    ci: [],
    other: [],
  };
}

/**
 * Categorize commits into change categories
 */
export function categorizeCommits(commits: ParsedCommit[]): CategorizedChanges {
  const categories = createEmptyCategories();

  for (const commit of commits) {
    const item: ChangeItem = {
      type: commit.type,
      description: commit.subject,
      commitHash: commit.hash,
      author: commit.author,
      issues: [],
      breaking: commit.breaking,
    };

    // Breaking changes take priority
    if (commit.breaking) {
      categories.breaking.push(item);
      continue;
    }

    // Categorize by type
    const category = TYPE_TO_CATEGORY[commit.type] || 'other';
    categories[category].push(item);
  }

  return categories;
}

/**
 * Categorize pull requests into change categories
 */
export function categorizePullRequests(prs: PullRequest[]): CategorizedChanges {
  const categories = createEmptyCategories();

  for (const pr of prs) {
    const item: ChangeItem = {
      type: '',
      description: pr.title,
      prNumber: pr.number,
      author: pr.author,
      issues: pr.closedIssues,
      breaking: pr.labels.includes('breaking-change'),
    };

    // Breaking changes take priority
    if (item.breaking) {
      categories.breaking.push(item);
      continue;
    }

    // Try to categorize by label first
    let categorized = false;
    for (const label of pr.labels) {
      const category = LABEL_TO_CATEGORY[label.toLowerCase()];
      if (category) {
        categories[category].push(item);
        categorized = true;
        break;
      }
    }

    // If not categorized by label, put in other
    if (!categorized) {
      categories.other.push(item);
    }
  }

  return categories;
}

/**
 * Merge two categorized changes
 */
export function mergeCategories(
  a: CategorizedChanges,
  b: CategorizedChanges
): CategorizedChanges {
  return {
    breaking: [...a.breaking, ...b.breaking],
    features: [...a.features, ...b.features],
    bugFixes: [...a.bugFixes, ...b.bugFixes],
    documentation: [...a.documentation, ...b.documentation],
    performance: [...a.performance, ...b.performance],
    refactoring: [...a.refactoring, ...b.refactoring],
    style: [...a.style, ...b.style],
    tests: [...a.tests, ...b.tests],
    build: [...a.build, ...b.build],
    ci: [...a.ci, ...b.ci],
    other: [...a.other, ...b.other],
  };
}

/**
 * Get statistics of categorized changes
 */
export function getCategoryStats(categories: CategorizedChanges): Record<string, number> {
  return {
    'Breaking Changes': categories.breaking.length,
    Features: categories.features.length,
    'Bug Fixes': categories.bugFixes.length,
    Documentation: categories.documentation.length,
    Performance: categories.performance.length,
    Refactoring: categories.refactoring.length,
    Style: categories.style.length,
    Tests: categories.tests.length,
    Build: categories.build.length,
    'CI/CD': categories.ci.length,
    Other: categories.other.length,
  };
}

/**
 * Log category statistics
 */
export function logCategoryStats(categories: CategorizedChanges): void {
  const stats = getCategoryStats(categories);

  core.info('Categorizing changes...');
  for (const [category, count] of Object.entries(stats)) {
    if (count > 0) {
      core.info(`  ${category}: ${count} items`);
    }
  }
}
