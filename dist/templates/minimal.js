"use strict";
/**
 * Minimal template with simple format
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinimalTemplate = void 0;
class MinimalTemplate {
    formatChangeItem(item, _owner, _repo) {
        let line = `- ${item.description}`;
        if (item.prNumber) {
            line += ` (#${item.prNumber})`;
        }
        return line;
    }
    formatCategory(_categoryKey, items, owner, repo) {
        if (items.length === 0)
            return '';
        let section = '';
        for (const item of items) {
            section += this.formatChangeItem(item, owner, repo) + '\n';
        }
        return section;
    }
    generate(data) {
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
exports.MinimalTemplate = MinimalTemplate;
//# sourceMappingURL=minimal.js.map