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
} from './utils';
import { applyCommitFilters } from './filter';
import { mergeContributors, extractContributorsFromCommits } from './contributors';
import { ReleasesManager } from './releases';
import { validateInputs } from './validator';
import { withGitHubRetry } from './retry';
import * as logger from './logger';
import type { ReleaseData } from './types';

async function run(): Promise<void> {
  const startTime = Date.now();

  try {
    logger.section('Auto Release Notes Generator');

    // Get inputs
    const token = core.getInput('github-token', { required: true });
    const template = core.getInput('template') || 'standard';
    const changelogFile = core.getInput('changelog-file') || 'CHANGELOG.md';
    const versionFileStr = core.getInput('version-file') || 'true';
    const versionFile = versionFileStr === 'true';
    const createGithubReleaseStr = core.getInput('create-github-release') || 'true';
    const createGithubRelease = createGithubReleaseStr === 'true';
    const dryRunStr = core.getInput('dry-run') || 'false';
    const dryRun = dryRunStr === 'true';

    logger.info(`Template: ${template}`);
    logger.info(`Changelog file: ${changelogFile}`);
    logger.info(`Dry run: ${dryRun}`);

    // Get GitHub context
    const context = github.context;
    const { owner, repo } = context.repo;

    logger.info(`Repository: ${owner}/${repo}`);
    logger.info(`Ref: ${context.ref}`);

    // Extract version from tag
    const version = extractVersion(context.ref);
    logger.info(`Detected version: ${version}`);

    // Validate all inputs
    const validation = await validateInputs({
      version,
      template,
      changelogFile,
      token,
      versionFile: versionFileStr,
      createGithubRelease: createGithubReleaseStr,
      dryRun: dryRunStr,
      excludeLabels: '',
    });

    if (!validation.valid) {
      throw new Error('Input validation failed. Please check the errors above.');
    }

    // Initialize collector with retry
    logger.section('Collecting Information');
    const collector = new Collector(token, owner, repo);

    // Get tags with retry
    logger.info('Fetching tags...');
    const tags = await withGitHubRetry(() => collector.getTags());

    // Find previous tag
    const currentTagIndex = tags.findIndex((t) => t.name === version);
    const previousTag =
      currentTagIndex >= 0 && currentTagIndex < tags.length - 1
        ? tags[currentTagIndex + 1]
        : null;

    if (previousTag) {
      logger.info(`Previous version: ${previousTag.name}`);
    } else {
      logger.info('No previous tag found (first release)');
    }

    // Collect commits with retry
    logger.info(`Fetching commits from ${previousTag?.name || 'start'} to ${version}...`);
    let commits = await withGitHubRetry(() =>
      collector.getCommitsBetweenTags(previousTag?.sha || null, version)
    );

    // Apply filters to commits
    logger.section('Filtering Changes');
    commits = applyCommitFilters(commits, {
      excludeChore: true,
      excludeMerge: false,
    });

    // Parse commits
    logger.section('Parsing Commits');
    logger.info('Parsing commits with Conventional Commits format...');
    const parsedCommits = parseCommits(commits);

    // Categorize changes
    logger.section('Categorizing Changes');
    const categories = categorizeCommits(parsedCommits);
    logCategoryStats(categories);

    // Extract contributors with bot filtering
    logger.section('Extracting Contributors');
    const commitContributors = extractContributorsFromCommits(parsedCommits);
    const contributors = mergeContributors(commitContributors);
    logger.info(`Contributors: ${contributors.length}`);

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

    // Generate release notes using template
    logger.section('Generating Release Notes');
    logger.info(`Using template: ${template}`);
    const releaseNotes = generateReleaseNotes(releaseData, template);

    // Write to CHANGELOG.md
    logger.section('Writing Files');
    logger.info(`Writing to ${changelogFile}...`);
    await writeChangelog(changelogFile, releaseNotes, dryRun);

    // Write version-specific file
    if (versionFile) {
      logger.info(`Writing version file...`);
      await writeVersionFile(version, releaseNotes, dryRun);
    }

    // Create GitHub Release with retry
    let releaseUrl = '';
    if (createGithubRelease) {
      if (dryRun) {
        logger.info(`[DRY RUN] Would create GitHub Release: ${version}`);
      } else {
        logger.section('Creating GitHub Release');
        const releasesManager = new ReleasesManager(token, owner, repo);
        releaseUrl = await withGitHubRetry(() =>
          releasesManager.createRelease(version, releaseNotes)
        );
      }
    }

    // Set outputs
    core.setOutput('release-notes', releaseNotes);
    core.setOutput('version', version);
    core.setOutput('changelog-url', releaseUrl);

    const duration = Date.now() - startTime;
    logger.section('Summary');
    logger.success(`Release notes generated successfully in ${duration}ms!`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Action failed: ${error.message}`);
      logger.error(`Stack trace: ${error.stack}`);
    } else {
      core.setFailed('Action failed with unknown error');
    }
  }
}

void run();
