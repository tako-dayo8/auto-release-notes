/**
 * Type definitions for release notes generation
 */
/**
 * Parsed commit information from Conventional Commits
 */
export interface ParsedCommit {
    /** Commit type (feat, fix, docs, etc.) */
    type: string;
    /** Optional scope */
    scope?: string;
    /** Commit subject/message */
    subject: string;
    /** Optional commit body */
    body?: string;
    /** Whether this is a breaking change */
    breaking: boolean;
    /** Commit hash */
    hash: string;
    /** Commit author */
    author: string;
    /** Commit date */
    date: Date;
}
/**
 * Pull request information
 */
export interface PullRequest {
    /** PR number */
    number: number;
    /** PR title */
    title: string;
    /** PR body/description */
    body: string | null;
    /** PR author username */
    author: string;
    /** PR labels */
    labels: string[];
    /** Merge date */
    mergedAt: Date;
    /** Closed issues */
    closedIssues: number[];
}
/**
 * Issue information
 */
export interface Issue {
    /** Issue number */
    number: number;
    /** Issue title */
    title: string;
    /** Issue labels */
    labels: string[];
}
/**
 * Change item for release notes
 */
export interface ChangeItem {
    /** Type of change */
    type: string;
    /** Description of change */
    description: string;
    /** PR number (if from PR) */
    prNumber?: number;
    /** Commit hash (if from commit) */
    commitHash?: string;
    /** Author username */
    author: string;
    /** Associated issue numbers */
    issues: number[];
    /** Whether this is a breaking change */
    breaking: boolean;
}
/**
 * Categorized changes for release notes
 */
export interface CategorizedChanges {
    /** Breaking changes */
    breaking: ChangeItem[];
    /** New features */
    features: ChangeItem[];
    /** Bug fixes */
    bugFixes: ChangeItem[];
    /** Documentation changes */
    documentation: ChangeItem[];
    /** Performance improvements */
    performance: ChangeItem[];
    /** Refactoring */
    refactoring: ChangeItem[];
    /** Style changes */
    style: ChangeItem[];
    /** Tests */
    tests: ChangeItem[];
    /** Build system changes */
    build: ChangeItem[];
    /** CI/CD changes */
    ci: ChangeItem[];
    /** Other changes */
    other: ChangeItem[];
}
/**
 * Release data for template generation
 */
export interface ReleaseData {
    /** Version string */
    version: string;
    /** Release date */
    date: string;
    /** Categorized changes */
    changes: CategorizedChanges;
    /** Contributors */
    contributors: string[];
    /** Compare URL (previous version to current) */
    compareUrl?: string;
    /** Repository owner */
    owner: string;
    /** Repository name */
    repo: string;
}
/**
 * Action inputs
 */
export interface ActionInputs {
    /** GitHub token */
    token: string;
    /** Template preset */
    template: string;
    /** Changelog file path */
    changelogFile: string;
    /** Enable version files */
    versionFile: boolean;
    /** Create GitHub Release */
    createGithubRelease: boolean;
    /** Exclude labels */
    excludeLabels: string[];
    /** Dry run mode */
    dryRun: boolean;
}
/**
 * Tag information
 */
export interface TagInfo {
    /** Tag name */
    name: string;
    /** Tag commit SHA */
    sha: string;
    /** Tag date */
    date: Date;
}
