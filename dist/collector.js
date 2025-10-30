"use strict";
/**
 * Information collector from GitHub API
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
exports.Collector = void 0;
const github_1 = require("@actions/github");
const core = __importStar(require("@actions/core"));
class Collector {
    octokit;
    owner;
    repo;
    constructor(token, owner, repo) {
        this.octokit = (0, github_1.getOctokit)(token);
        this.owner = owner;
        this.repo = repo;
    }
    /**
     * Get all tags in the repository
     */
    async getTags() {
        core.debug('Fetching tags...');
        const { data: tags } = await this.octokit.rest.repos.listTags({
            owner: this.owner,
            repo: this.repo,
            per_page: 100,
        });
        return tags.map((tag) => ({
            name: tag.name,
            sha: tag.commit.sha,
            date: new Date(), // Will be updated with commit date
        }));
    }
    /**
     * Get tag by name
     */
    async getTagByName(tagName) {
        try {
            core.debug(`Fetching tag: ${tagName}`);
            const { data: tag } = await this.octokit.rest.git.getRef({
                owner: this.owner,
                repo: this.repo,
                ref: `tags/${tagName}`,
            });
            const { data: commit } = await this.octokit.rest.git.getCommit({
                owner: this.owner,
                repo: this.repo,
                commit_sha: tag.object.sha,
            });
            return {
                name: tagName,
                sha: tag.object.sha,
                date: new Date(commit.committer.date),
            };
        }
        catch (error) {
            core.debug(`Tag not found: ${tagName}`);
            return null;
        }
    }
    /**
     * Get commits between two tags
     */
    async getCommitsBetweenTags(previousTag, currentTag) {
        core.debug(`Fetching commits between ${previousTag || 'start'} and ${currentTag}...`);
        const commits = [];
        let page = 1;
        let hasMore = true;
        while (hasMore) {
            const { data } = await this.octokit.rest.repos.listCommits({
                owner: this.owner,
                repo: this.repo,
                sha: currentTag,
                per_page: 100,
                page,
            });
            for (const commit of data) {
                // Stop if we reached the previous tag
                if (previousTag && commit.sha === previousTag) {
                    hasMore = false;
                    break;
                }
                commits.push({
                    type: '',
                    subject: commit.commit.message.split('\n')[0],
                    body: commit.commit.message.split('\n').slice(1).join('\n').trim(),
                    breaking: false,
                    hash: commit.sha.substring(0, 7),
                    author: commit.author?.login || commit.commit.author?.name || 'unknown',
                    date: new Date(commit.commit.author?.date || Date.now()),
                });
            }
            if (data.length < 100) {
                hasMore = false;
            }
            page++;
        }
        core.info(`Found ${commits.length} commits`);
        return commits;
    }
    /**
     * Get merged pull requests between two tags
     */
    async getMergedPRs(since) {
        core.debug('Fetching merged pull requests...');
        const prs = [];
        let page = 1;
        let hasMore = true;
        while (hasMore) {
            const { data } = await this.octokit.rest.pulls.list({
                owner: this.owner,
                repo: this.repo,
                state: 'closed',
                sort: 'updated',
                direction: 'desc',
                per_page: 100,
                page,
            });
            for (const pr of data) {
                if (!pr.merged_at)
                    continue;
                const mergedAt = new Date(pr.merged_at);
                // Stop if we've gone past the since date
                if (since && mergedAt < since) {
                    hasMore = false;
                    break;
                }
                // Extract closed issues from PR body
                const closedIssues = this.extractClosedIssues(pr.body || '');
                prs.push({
                    number: pr.number,
                    title: pr.title,
                    body: pr.body,
                    author: pr.user?.login || 'unknown',
                    labels: pr.labels.map((label) => typeof label === 'string' ? label : label.name || ''),
                    mergedAt,
                    closedIssues,
                });
            }
            if (data.length < 100) {
                hasMore = false;
            }
            page++;
        }
        core.info(`Found ${prs.length} merged PRs`);
        return prs;
    }
    /**
     * Extract closed issue numbers from PR body
     */
    extractClosedIssues(body) {
        const issues = [];
        // Match patterns like "Closes #123", "Fixes #456", "Resolves #789"
        const regex = /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/gi;
        let match;
        while ((match = regex.exec(body)) !== null) {
            issues.push(parseInt(match[1], 10));
        }
        return issues;
    }
    /**
     * Get issue by number
     */
    async getIssue(issueNumber) {
        try {
            const { data } = await this.octokit.rest.issues.get({
                owner: this.owner,
                repo: this.repo,
                issue_number: issueNumber,
            });
            return {
                number: data.number,
                title: data.title,
                labels: data.labels.map((label) => typeof label === 'string' ? label : label.name || ''),
            };
        }
        catch (error) {
            core.debug(`Issue not found: #${issueNumber}`);
            return null;
        }
    }
    /**
     * Get multiple issues by numbers
     */
    async getIssues(issueNumbers) {
        const issues = [];
        for (const num of issueNumbers) {
            const issue = await this.getIssue(num);
            if (issue) {
                issues.push(issue);
            }
        }
        return issues;
    }
}
exports.Collector = Collector;
//# sourceMappingURL=collector.js.map