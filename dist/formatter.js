"use strict";
/**
 * Text formatter for release notes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkifyIssues = linkifyIssues;
exports.linkifyPRs = linkifyPRs;
exports.linkifyCommits = linkifyCommits;
exports.escapeMarkdown = escapeMarkdown;
exports.truncate = truncate;
exports.formatUsername = formatUsername;
exports.toTitleCase = toTitleCase;
exports.removeDuplicateLines = removeDuplicateLines;
/**
 * Convert issue numbers (#123) to GitHub links
 */
function linkifyIssues(text, owner, repo) {
    // Match #123 pattern but not if already in a link
    return text.replace(/(?<!\[)#(\d+)(?!\])/g, `[#$1](https://github.com/${owner}/${repo}/issues/$1)`);
}
/**
 * Convert PR numbers to GitHub links
 */
function linkifyPRs(text, owner, repo) {
    return text.replace(/(?<!\[)#(\d+)(?!\])/g, `[#$1](https://github.com/${owner}/${repo}/pull/$1)`);
}
/**
 * Convert commit hashes to GitHub links
 */
function linkifyCommits(text, owner, repo) {
    // Match 7-character commit hashes
    return text.replace(/\b([0-9a-f]{7})\b/g, `[\`$1\`](https://github.com/${owner}/${repo}/commit/$1)`);
}
/**
 * Escape markdown special characters
 */
function escapeMarkdown(text) {
    return text.replace(/([\\`*_{}[\]()#+\-.!])/g, '\\$1');
}
/**
 * Truncate text to maximum length
 */
function truncate(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - 3) + '...';
}
/**
 * Format username with @ prefix
 */
function formatUsername(username) {
    return username.startsWith('@') ? username : `@${username}`;
}
/**
 * Convert text to title case
 */
function toTitleCase(text) {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
}
/**
 * Remove duplicate lines from text
 */
function removeDuplicateLines(text) {
    const lines = text.split('\n');
    const unique = Array.from(new Set(lines));
    return unique.join('\n');
}
//# sourceMappingURL=formatter.js.map