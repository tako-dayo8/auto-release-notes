/**
 * Information collector from GitHub API
 */
import type { PullRequest, Issue, TagInfo, ParsedCommit } from './types';
export declare class Collector {
    private octokit;
    private owner;
    private repo;
    constructor(token: string, owner: string, repo: string);
    /**
     * Get all tags in the repository
     */
    getTags(): Promise<TagInfo[]>;
    /**
     * Get tag by name
     */
    getTagByName(tagName: string): Promise<TagInfo | null>;
    /**
     * Get commits between two tags
     */
    getCommitsBetweenTags(previousTag: string | null, currentTag: string): Promise<ParsedCommit[]>;
    /**
     * Get merged pull requests between two tags
     */
    getMergedPRs(since: Date | null): Promise<PullRequest[]>;
    /**
     * Extract closed issue numbers from PR body
     */
    private extractClosedIssues;
    /**
     * Get issue by number
     */
    getIssue(issueNumber: number): Promise<Issue | null>;
    /**
     * Get multiple issues by numbers
     */
    getIssues(issueNumbers: number[]): Promise<Issue[]>;
}
