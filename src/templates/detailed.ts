/**
 * Detailed template with extra information
 */

import type { ReleaseData, ChangeItem, CategorizedChanges } from '../types';
import { Template, CATEGORY_DISPLAY } from './base';

export class DetailedTemplate implements Template {
  formatChangeItem(item: ChangeItem, owner: string, repo: string): string {
    let line = `- ${item.description}`;

    // Add PR/commit reference
    if (item.prNumber) {
      line += ` ([#${item.prNumber}](https://github.com/${owner}/${repo}/pull/${item.prNumber}))`;
    } else if (item.commitHash) {
      line += ` ([\`${item.commitHash}\`](https://github.com/${owner}/${repo}/commit/${item.commitHash}))`;
    }

    if (item.author) {
      line += ` @${item.author}`;
    }

    // Add related issues
    if (item.issues && item.issues.length > 0) {
      const issueLinks = item.issues
        .map((num) => `[#${num}](https://github.com/${owner}/${repo}/issues/${num})`)
        .join(', ');
      line += `\n  - Closes: ${issueLinks}`;
    }

    return line;
  }

  formatCategory(categoryKey: string, items: ChangeItem[], owner: string, repo: string): string {
    if (items.length === 0) return '';

    const display = CATEGORY_DISPLAY[categoryKey] || {
      emoji: '📦',
      title: 'Other Changes',
    };

    let section = `\n### ${display.emoji} ${display.title} (${items.length})\n\n`;

    for (const item of items) {
      section += this.formatChangeItem(item, owner, repo) + '\n';
    }

    return section;
  }

  private getStatistics(changes: CategorizedChanges): string {
    const total =
      changes.breaking.length +
      changes.features.length +
      changes.bugFixes.length +
      changes.documentation.length +
      changes.performance.length +
      changes.refactoring.length +
      changes.style.length +
      changes.tests.length +
      changes.build.length +
      changes.ci.length +
      changes.other.length;

    return `\n### 📊 Statistics\n\n- ${total} changes\n- ${changes.features.length} features\n- ${changes.bugFixes.length} bug fixes\n- ${changes.breaking.length} breaking changes\n`;
  }

  private getContributorStats(data: ReleaseData): string {
    if (data.contributors.length === 0) return '';

    let section = `\n### 👥 Contributors\n\nThis release was made possible by ${data.contributors.length} contributor${data.contributors.length > 1 ? 's' : ''}:\n\n`;

    section += data.contributors.map((c) => `- @${c}`).join('\n') + '\n';

    return section;
  }

  generate(data: ReleaseData): string {
    let content = `## [${data.version}] - ${data.date}\n`;

    // Add statistics
    content += this.getStatistics(data.changes);

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
      content += this.formatCategory(category, items, data.owner, data.repo);
    }

    // Add detailed contributor section
    content += this.getContributorStats(data);

    // Add compare URL
    if (data.compareUrl) {
      content += `\n**Full Changelog**: ${data.compareUrl}\n`;
    }

    return content;
  }
}
