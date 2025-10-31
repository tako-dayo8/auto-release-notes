/**
 * Minimal template with simple format
 */

import type { ReleaseData, ChangeItem } from '../types';
import { Template } from './base';

export class MinimalTemplate implements Template {
  formatChangeItem(item: ChangeItem, _owner: string, _repo: string): string {
    let line = `- ${item.description}`;

    if (item.prNumber) {
      line += ` (#${item.prNumber})`;
    }

    return line;
  }

  formatCategory(_categoryKey: string, items: ChangeItem[], owner: string, repo: string): string {
    if (items.length === 0) return '';

    let section = '';
    for (const item of items) {
      section += this.formatChangeItem(item, owner, repo) + '\n';
    }

    return section;
  }

  generate(data: ReleaseData): string {
    let content = `## ${data.version} - ${data.date}\n\n`;

    // Flatten all changes without categorization
    const allChanges = [
      ...data.changes.breaking,
      ...data.changes.features,
      ...data.changes.bugFixes,
      ...data.changes.documentation,
      ...data.changes.performance,
      ...data.changes.refactoring,
      ...data.changes.style,
      ...data.changes.tests,
      ...data.changes.build,
      ...data.changes.ci,
      ...data.changes.other,
    ];

    for (const item of allChanges) {
      content += this.formatChangeItem(item, data.owner, data.repo) + '\n';
    }

    // Add simple compare URL if available
    if (data.compareUrl) {
      content += `\nChanges: ${data.compareUrl}\n`;
    }

    return content;
  }
}
