"use strict";
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
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const collector_1 = require("./collector");
const parser_1 = require("./parser");
const categorizer_1 = require("./categorizer");
const writer_1 = require("./writer");
const utils_1 = require("./utils");
const filter_1 = require("./filter");
const contributors_1 = require("./contributors");
const releases_1 = require("./releases");
async function run() {
    try {
        // Get inputs
        const token = core.getInput('github-token', { required: true });
        const template = core.getInput('template') || 'standard';
        const changelogFile = core.getInput('changelog-file') || 'CHANGELOG.md';
        const versionFile = core.getInput('version-file') === 'true';
        const createGithubRelease = core.getInput('create-github-release') === 'true';
        // TODO: This will be used when PR filtering is implemented
        // const excludeLabelsInput = core.getInput('exclude-labels') || 'skip-changelog,no-changelog';
        // const excludeLabels = excludeLabelsInput.split(',').map((s) => s.trim());
        const dryRun = core.getInput('dry-run') === 'true';
        core.info('Starting release notes generation...');
        core.info(`Template: ${template}`);
        core.info(`Changelog file: ${changelogFile}`);
        core.info(`Dry run: ${dryRun}`);
        // Get GitHub context
        const context = github.context;
        const { owner, repo } = context.repo;
        core.info(`Repository: ${owner}/${repo}`);
        core.info(`Ref: ${context.ref}`);
        // Extract version from tag
        const version = (0, utils_1.extractVersion)(context.ref);
        core.info(`Detected version: ${version}`);
        // Validate version format
        if (!(0, utils_1.isValidSemver)(version)) {
            throw new Error(`Invalid tag format: ${version}. Expected Semantic Versioning (e.g., v1.2.3)`);
        }
        // Initialize collector
        const collector = new collector_1.Collector(token, owner, repo);
        // Get tags
        core.info('Fetching tags...');
        const tags = await collector.getTags();
        // Find previous tag
        const currentTagIndex = tags.findIndex((t) => t.name === version);
        const previousTag = currentTagIndex >= 0 && currentTagIndex < tags.length - 1
            ? tags[currentTagIndex + 1]
            : null;
        if (previousTag) {
            core.info(`Previous version: ${previousTag.name}`);
        }
        else {
            core.info('No previous tag found (first release)');
        }
        // Collect commits
        core.info(`Fetching commits from ${previousTag?.name || 'start'} to ${version}...`);
        let commits = await collector.getCommitsBetweenTags(previousTag?.sha || null, version);
        // Apply filters to commits
        core.info('Applying filters...');
        commits = (0, filter_1.applyCommitFilters)(commits, {
            excludeChore: true,
            excludeMerge: false,
        });
        // Parse commits
        core.info('Parsing commits with Conventional Commits format...');
        const parsedCommits = (0, parser_1.parseCommits)(commits);
        // Categorize changes
        const categories = (0, categorizer_1.categorizeCommits)(parsedCommits);
        (0, categorizer_1.logCategoryStats)(categories);
        // Extract contributors with bot filtering
        const commitContributors = (0, contributors_1.extractContributorsFromCommits)(parsedCommits);
        const contributors = (0, contributors_1.mergeContributors)(commitContributors);
        core.info(`Contributors: ${contributors.length}`);
        // Generate compare URL
        const compareUrl = previousTag
            ? (0, utils_1.generateCompareUrl)(owner, repo, previousTag.name, version)
            : undefined;
        // Prepare release data
        const releaseData = {
            version,
            date: (0, utils_1.formatDate)(new Date()),
            changes: categories,
            contributors,
            compareUrl,
            owner,
            repo,
        };
        // Generate release notes
        core.info('Generating release notes...');
        const releaseNotes = (0, writer_1.generateReleaseNotes)(releaseData);
        // Write to CHANGELOG.md
        core.info(`Writing to ${changelogFile}...`);
        await (0, writer_1.writeChangelog)(changelogFile, releaseNotes, dryRun);
        // Write version-specific file
        if (versionFile) {
            core.info(`Writing version file...`);
            await (0, writer_1.writeVersionFile)(version, releaseNotes, dryRun);
        }
        // Create GitHub Release
        let releaseUrl = '';
        if (createGithubRelease) {
            if (dryRun) {
                core.info(`[DRY RUN] Would create GitHub Release: ${version}`);
            }
            else {
                core.info('Creating GitHub Release...');
                const releasesManager = new releases_1.ReleasesManager(token, owner, repo);
                releaseUrl = await releasesManager.createRelease(version, releaseNotes);
            }
        }
        // Set outputs
        core.setOutput('release-notes', releaseNotes);
        core.setOutput('version', version);
        core.setOutput('changelog-url', releaseUrl);
        core.info('✓ Release notes generated successfully!');
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(`Action failed: ${error.message}`);
        }
        else {
            core.setFailed('Action failed with unknown error');
        }
    }
}
void run();
//# sourceMappingURL=main.js.map