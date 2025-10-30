/**
 * CHANGELOG writer
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as core from '@actions/core';
import type { ReleaseData, ChangeItem } from './types';

/**
 * Category display names and emojis
 */
const CATEGORY_DISPLAY: Record<string, { emoji: string; title: string }> = {
  breaking: { emoji: '🚨', title: 'Breaking Changes' },
  features: { emoji: '✨', title: 'Features' },
  bugFixes: { emoji: '🐛', title: 'Bug Fixes' },
  documentation: { emoji: '📚', title: 'Documentation' },
  performance: { emoji: '⚡', title: 'Performance' },
  refactoring: { emoji: '🔧', title: 'Refactoring' },
  style: { emoji: '🎨', title: 'Style' },
  tests: { emoji: '✅', title: 'Tests' },
  build: { emoji: '🔨', title: 'Build System' },
  ci: { emoji: '🤖', title: 'CI/CD' },
  other: { emoji: '📦', title: 'Other Changes' },
};

/**
 * Format a change item
 */
function formatChangeItem(item: ChangeItem, owner: string, repo: string): string {
  let line = `- ${item.description}`;

  if (item.prNumber) {
    line += ` ([#${item.prNumber}](https://github.com/${owner}/${repo}/pull/${item.prNumber}))`;
  }

  if (item.author) {
    line += ` @${item.author}`;
  }

  return line;
}

/**
 * Format a category section
 */
function formatCategory(
  categoryKey: string,
  items: ChangeItem[],
  owner: string,
  repo: string
): string {
  if (items.length === 0) return '';

  const display = CATEGORY_DISPLAY[categoryKey] || {
    emoji: '📦',
    title: 'Other Changes',
  };

  let section = `\n### ${display.emoji} ${display.title}\n\n`;

  for (const item of items) {
    section += formatChangeItem(item, owner, repo) + '\n';
  }

  return section;
}

/**
 * Generate release notes content
 */
export function generateReleaseNotes(data: ReleaseData): string {
  let content = `## [${data.version}] - ${data.date}\n`;

  // Add categories in order
  const categories: (keyof typeof data.changes)[] = [
    'breaking',
    'features',
    'bugFixes',
    'documentation',
    'performance',
    'refactoring',
    'style',
    'tests',
    'build',
    'ci',
    'other',
  ];

  for (const category of categories) {
    const items = data.changes[category];
    content += formatCategory(category, items, data.owner, data.repo);
  }

  // Add contributors
  if (data.contributors.length > 0) {
    content += `\n### Contributors\n\n`;
    content += data.contributors.map((c) => `@${c}`).join(', ') + '\n';
  }

  // Add compare URL
  if (data.compareUrl) {
    content += `\n**Full Changelog**: ${data.compareUrl}\n`;
  }

  return content;
}

/**
 * Write content to CHANGELOG.md
 */
export async function writeChangelog(
  filePath: string,
  newContent: string,
  dryRun = false
): Promise<void> {
  if (dryRun) {
    core.info(`[DRY RUN] Would write to: ${filePath}`);
    core.info('----------------------------------------');
    core.info(newContent);
    core.info('----------------------------------------');
    return;
  }

  let existingContent = '';

  // Read existing changelog if it exists
  try {
    existingContent = await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    core.debug(`CHANGELOG file not found, creating new one: ${filePath}`);
  }

  // Combine new and existing content
  let finalContent: string;

  if (existingContent) {
    // Insert new content after the title (if exists) or at the beginning
    const lines = existingContent.split('\n');
    const titleIndex = lines.findIndex((line) => line.startsWith('# '));

    if (titleIndex >= 0) {
      // Insert after title
      lines.splice(titleIndex + 1, 0, '\n' + newContent);
      finalContent = lines.join('\n');
    } else {
      // Insert at beginning
      finalContent = newContent + '\n\n' + existingContent;
    }
  } else {
    // Create new changelog with title
    finalContent = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${newContent}`;
  }

  // Write to file
  await fs.writeFile(filePath, finalContent, 'utf-8');
  core.info(`✓ Written to ${filePath}`);
}

/**
 * Write version-specific changelog file
 */
export async function writeVersionFile(
  version: string,
  content: string,
  dryRun = false
): Promise<void> {
  const dirPath = 'changelog';
  const fileName = `${version.replace(/^v/, '')}.md`;
  const filePath = path.join(dirPath, fileName);

  if (dryRun) {
    core.info(`[DRY RUN] Would write to: ${filePath}`);
    return;
  }

  // Create directory if it doesn't exist
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  // Write version file
  await fs.writeFile(filePath, content, 'utf-8');
  core.info(`✓ Written to ${filePath}`);
}
