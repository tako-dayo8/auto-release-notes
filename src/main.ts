import * as core from '@actions/core';
import * as github from '@actions/github';
import { Collector } from './collector';
import { parseCommits } from './parser';
import { categorizeCommits, logCategoryStats } from './categorizer';
import { generateReleaseNotes, writeChangelog, writeVersionFile } from './writer';
import {
  extractVersion,
  formatDate,
  generateCompareUrl,
  isValidSemver,
} from './utils';
import type { ReleaseData } from './types';

async function run(): Promise<void> {
  try {
    // Get inputs
    const token = core.getInput('github-token', { required: true });
    const template = core.getInput('template') || 'standard';
    const changelogFile = core.getInput('changelog-file') || 'CHANGELOG.md';
    const versionFile = core.getInput('version-file') === 'true';
    // const createGithubRelease = core.getInput('create-github-release') === 'true';
    // const excludeLabels = core.getInput('exclude-labels') || 'skip-changelog,no-changelog';
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
    const version = extractVersion(context.ref);
    core.info(`Detected version: ${version}`);

    // Validate version format
    if (!isValidSemver(version)) {
      throw new Error(
        `Invalid tag format: ${version}. Expected Semantic Versioning (e.g., v1.2.3)`
      );
    }

    // Initialize collector
    const collector = new Collector(token, owner, repo);

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
    } else {
      core.info('No previous tag found (first release)');
    }

    // Collect commits
    core.info(`Fetching commits from ${previousTag?.name || 'start'} to ${version}...`);
    const commits = await collector.getCommitsBetweenTags(
      previousTag?.sha || null,
      version
    );

    // Parse commits
    core.info('Parsing commits with Conventional Commits format...');
    const parsedCommits = parseCommits(commits);

    // Categorize changes
    const categories = categorizeCommits(parsedCommits);
    logCategoryStats(categories);

    // Extract contributors
    const contributors = Array.from(
      new Set(parsedCommits.map((c) => c.author).filter((a) => a !== 'unknown'))
    ).sort();
    core.info(`Contributors: ${contributors.length}`);

    // Generate compare URL
    const compareUrl = previousTag
      ? generateCompareUrl(owner, repo, previousTag.name, version)
      : undefined;

    // Prepare release data
    const releaseData: ReleaseData = {
      version,
      date: formatDate(new Date()),
      changes: categories,
      contributors,
      compareUrl,
      owner,
      repo,
    };

    // Generate release notes
    core.info('Generating release notes...');
    const releaseNotes = generateReleaseNotes(releaseData);

    // Write to CHANGELOG.md
    core.info(`Writing to ${changelogFile}...`);
    await writeChangelog(changelogFile, releaseNotes, dryRun);

    // Write version-specific file
    if (versionFile) {
      core.info(`Writing version file...`);
      await writeVersionFile(version, releaseNotes, dryRun);
    }

    // Set outputs
    core.setOutput('release-notes', releaseNotes);
    core.setOutput('version', version);
    core.setOutput('changelog-url', '');

    core.info('✓ Release notes generated successfully!');
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Action failed: ${error.message}`);
    } else {
      core.setFailed('Action failed with unknown error');
    }
  }
}

void run();
