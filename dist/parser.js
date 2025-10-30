"use strict";
/**
 * Conventional Commits parser
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCommit = parseCommit;
exports.parseCommits = parseCommits;
exports.extractTypeFromPRTitle = extractTypeFromPRTitle;
exports.isConventionalCommit = isConventionalCommit;
const conventional_commits_parser_1 = __importDefault(require("conventional-commits-parser"));
/**
 * Parse a commit message using Conventional Commits format
 */
function parseCommit(commit) {
    try {
        const parsed = conventional_commits_parser_1.default.sync(commit.subject + '\n\n' + (commit.body || ''));
        return {
            ...commit,
            type: parsed.type || '',
            scope: parsed.scope || undefined,
            subject: parsed.subject || commit.subject,
            body: parsed.body || commit.body,
            breaking: parsed.notes?.some((note) => note.title === 'BREAKING CHANGE') ||
                commit.subject.includes('!:') ||
                false,
        };
    }
    catch (error) {
        // If parsing fails, return the original commit
        return commit;
    }
}
/**
 * Parse multiple commits
 */
function parseCommits(commits) {
    return commits.map(parseCommit);
}
/**
 * Extract type from PR title using Conventional Commits format
 */
function extractTypeFromPRTitle(title) {
    const match = title.match(/^(\w+)(?:\([\w-]+\))?:/);
    return match ? match[1] : null;
}
/**
 * Check if commit message matches Conventional Commits format
 */
function isConventionalCommit(message) {
    const conventionalRegex = /^(\w+)(?:\([\w-]+\))?!?:\s.+/;
    return conventionalRegex.test(message);
}
//# sourceMappingURL=parser.js.map