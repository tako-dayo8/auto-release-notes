/**
 * Text formatter for release notes
 */

/**
 * Convert issue numbers (#123) to GitHub links
 */
export function linkifyIssues(text: string, owner: string, repo: string): string {
  // Match #123 pattern but not if already in a link
  return text.replace(
    /(?<!\[)#(\d+)(?!\])/g,
    `[#$1](https://github.com/${owner}/${repo}/issues/$1)`
  );
}

/**
 * Convert PR numbers to GitHub links
 */
export function linkifyPRs(text: string, owner: string, repo: string): string {
  return text.replace(
    /(?<!\[)#(\d+)(?!\])/g,
    `[#$1](https://github.com/${owner}/${repo}/pull/$1)`
  );
}

/**
 * Convert commit hashes to GitHub links
 */
export function linkifyCommits(text: string, owner: string, repo: string): string {
  // Match 7-character commit hashes
  return text.replace(
    /\b([0-9a-f]{7})\b/g,
    `[\`$1\`](https://github.com/${owner}/${repo}/commit/$1)`
  );
}

/**
 * Escape markdown special characters
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_{}[\]()#+\-.!])/g, '\\$1');
}

/**
 * Truncate text to maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format username with @ prefix
 */
export function formatUsername(username: string): string {
  return username.startsWith('@') ? username : `@${username}`;
}

/**
 * Convert text to title case
 */
export function toTitleCase(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Remove duplicate lines from text
 */
export function removeDuplicateLines(text: string): string {
  const lines = text.split('\n');
  const unique = Array.from(new Set(lines));
  return unique.join('\n');
}
