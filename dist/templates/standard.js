"use strict";
/**
 * Standard template
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardTemplate = void 0;
const base_1 = require("./base");
class StandardTemplate {
    formatChangeItem(item, owner, repo) {
        let line = `- ${item.description}`;
        if (item.prNumber) {
            line += ` ([#${item.prNumber}](https://github.com/${owner}/${repo}/pull/${item.prNumber}))`;
        }
        if (item.author) {
            line += ` @${item.author}`;
        }
        return line;
    }
    formatCategory(categoryKey, items, owner, repo) {
        if (items.length === 0)
            return '';
        const display = base_1.CATEGORY_DISPLAY[categoryKey] || {
            emoji: '📦',
            title: 'Other Changes',
        };
        let section = `\n### ${display.emoji} ${display.title}\n\n`;
        for (const item of items) {
            section += this.formatChangeItem(item, owner, repo) + '\n';
        }
        return section;
    }
    generate(data) {
        let content = `## [${data.version}] - ${data.date}\n`;
        // Add categories in order
        const categories = [
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
}
exports.StandardTemplate = StandardTemplate;
//# sourceMappingURL=standard.js.map