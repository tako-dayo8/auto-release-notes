"use strict";
/**
 * Contributors management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBotAccount = isBotAccount;
exports.extractContributorsFromCommits = extractContributorsFromCommits;
exports.extractContributorsFromPRs = extractContributorsFromPRs;
exports.mergeContributors = mergeContributors;
exports.getContributorStats = getContributorStats;
exports.formatContributors = formatContributors;
/**
 * Bot account patterns to exclude
 */
const BOT_PATTERNS = [
    'dependabot[bot]',
    'renovate[bot]',
    'github-actions[bot]',
    'greenkeeper[bot]',
    'snyk-bot',
    'codecov-io',
    'allcontributors[bot]',
];
/**
 * Check if username is a bot account
 */
function isBotAccount(username) {
    const lower = username.toLowerCase();
    return BOT_PATTERNS.some((pattern) => lower.includes(pattern.toLowerCase()));
}
/**
 * Extract contributors from commits
 */
function extractContributorsFromCommits(commits) {
    const contributors = new Set();
    for (const commit of commits) {
        if (commit.author && commit.author !== 'unknown' && !isBotAccount(commit.author)) {
            contributors.add(commit.author);
        }
    }
    return Array.from(contributors);
}
/**
 * Extract contributors from PRs
 */
function extractContributorsFromPRs(prs) {
    const contributors = new Set();
    for (const pr of prs) {
        if (pr.author && pr.author !== 'unknown' && !isBotAccount(pr.author)) {
            contributors.add(pr.author);
        }
    }
    return Array.from(contributors);
}
/**
 * Merge and deduplicate contributors from multiple sources
 */
function mergeContributors(...contributorLists) {
    const allContributors = new Set();
    for (const list of contributorLists) {
        for (const contributor of list) {
            if (contributor && contributor !== 'unknown' && !isBotAccount(contributor)) {
                allContributors.add(contributor);
            }
        }
    }
    return Array.from(allContributors).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}
/**
 * Get contributor count by username
 */
function getContributorStats(commits, prs) {
    const stats = new Map();
    // Count commits
    for (const commit of commits) {
        if (commit.author && !isBotAccount(commit.author)) {
            const current = stats.get(commit.author) || { commits: 0, prs: 0 };
            current.commits++;
            stats.set(commit.author, current);
        }
    }
    // Count PRs
    for (const pr of prs) {
        if (pr.author && !isBotAccount(pr.author)) {
            const current = stats.get(pr.author) || { commits: 0, prs: 0 };
            current.prs++;
            stats.set(pr.author, current);
        }
    }
    return stats;
}
/**
 * Format contributors list
 */
function formatContributors(contributors) {
    if (contributors.length === 0) {
        return '';
    }
    return contributors.map((c) => `@${c}`).join(', ');
}
//# sourceMappingURL=contributors.js.map