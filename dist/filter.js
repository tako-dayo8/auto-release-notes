"use strict";
/**
 * Filter for excluding commits and PRs
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChoreCommit = isChoreCommit;
exports.isMergeCommit = isMergeCommit;
exports.filterChoreCommits = filterChoreCommits;
exports.filterMergeCommits = filterMergeCommits;
exports.hasExcludeLabel = hasExcludeLabel;
exports.filterPRsByLabels = filterPRsByLabels;
exports.applyCommitFilters = applyCommitFilters;
exports.applyPRFilters = applyPRFilters;
const core = __importStar(require("@actions/core"));
/**
 * Check if commit is a chore commit
 */
function isChoreCommit(commit) {
    return /^chore(\(.*?\))?:/i.test(commit.subject);
}
/**
 * Check if commit is a merge commit
 */
function isMergeCommit(commit) {
    return /^merge (branch|pull request)/i.test(commit.subject);
}
/**
 * Filter out chore commits
 */
function filterChoreCommits(commits) {
    const filtered = commits.filter((commit) => !isChoreCommit(commit));
    const excluded = commits.length - filtered.length;
    if (excluded > 0) {
        core.info(`Excluding ${excluded} chore commits`);
    }
    return filtered;
}
/**
 * Filter out merge commits
 */
function filterMergeCommits(commits) {
    const filtered = commits.filter((commit) => !isMergeCommit(commit));
    const excluded = commits.length - filtered.length;
    if (excluded > 0) {
        core.info(`Excluding ${excluded} merge commits`);
    }
    return filtered;
}
/**
 * Check if PR has any of the exclude labels
 */
function hasExcludeLabel(pr, excludeLabels) {
    return pr.labels.some((label) => excludeLabels.some((exclude) => label.toLowerCase() === exclude.toLowerCase()));
}
/**
 * Filter out PRs with exclude labels
 */
function filterPRsByLabels(prs, excludeLabels) {
    if (excludeLabels.length === 0) {
        return prs;
    }
    const filtered = prs.filter((pr) => !hasExcludeLabel(pr, excludeLabels));
    const excluded = prs.length - filtered.length;
    if (excluded > 0) {
        core.info(`Excluding ${excluded} PRs with labels: ${excludeLabels.join(', ')}`);
    }
    return filtered;
}
/**
 * Apply all filters to commits
 */
function applyCommitFilters(commits, options = {}) {
    let filtered = commits;
    if (options.excludeChore !== false) {
        filtered = filterChoreCommits(filtered);
    }
    if (options.excludeMerge === true) {
        filtered = filterMergeCommits(filtered);
    }
    return filtered;
}
/**
 * Apply all filters to PRs
 */
function applyPRFilters(prs, excludeLabels) {
    return filterPRsByLabels(prs, excludeLabels);
}
//# sourceMappingURL=filter.js.map