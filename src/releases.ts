/**
 * GitHub Releases management
 */

import { getOctokit } from '@actions/github';
import * as core from '@actions/core';
import { isPrereleaseVersion } from './utils';

export class ReleasesManager {
  private octokit: ReturnType<typeof getOctokit>;
  private owner: string;
  private repo: string;

  constructor(token: string, owner: string, repo: string) {
    this.octokit = getOctokit(token);
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Check if a release already exists for a tag
   */
  async releaseExists(tagName: string): Promise<boolean> {
    try {
      await this.octokit.rest.repos.getReleaseByTag({
        owner: this.owner,
        repo: this.repo,
        tag: tagName,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a GitHub Release
   */
  async createRelease(
    tagName: string,
    body: string,
    options: {
      draft?: boolean;
      prerelease?: boolean;
      name?: string;
    } = {}
  ): Promise<string> {
    const {
      draft = false,
      prerelease = isPrereleaseVersion(tagName),
      name = `Release ${tagName}`,
    } = options;

    core.info(`Creating GitHub Release: ${tagName}`);
    core.debug(`Draft: ${draft}, Prerelease: ${prerelease}`);

    // Check if release already exists
    const exists = await this.releaseExists(tagName);
    if (exists) {
      core.warning(`Release ${tagName} already exists, skipping creation`);
      return `https://github.com/${this.owner}/${this.repo}/releases/tag/${tagName}`;
    }

    // Create the release
    const { data } = await this.octokit.rest.repos.createRelease({
      owner: this.owner,
      repo: this.repo,
      tag_name: tagName,
      name,
      body,
      draft,
      prerelease,
    });

    core.info(`✓ GitHub Release created: ${data.html_url}`);
    return data.html_url;
  }

  /**
   * Update an existing GitHub Release
   */
  async updateRelease(
    tagName: string,
    body: string,
    options: {
      draft?: boolean;
      prerelease?: boolean;
      name?: string;
    } = {}
  ): Promise<string> {
    core.info(`Updating GitHub Release: ${tagName}`);

    // Get the existing release
    const { data: release } = await this.octokit.rest.repos.getReleaseByTag({
      owner: this.owner,
      repo: this.repo,
      tag: tagName,
    });

    // Update the release
    const { data } = await this.octokit.rest.repos.updateRelease({
      owner: this.owner,
      repo: this.repo,
      release_id: release.id,
      body,
      draft: options.draft,
      prerelease: options.prerelease,
      name: options.name,
    });

    core.info(`✓ GitHub Release updated: ${data.html_url}`);
    return data.html_url;
  }

  /**
   * Create or update a GitHub Release
   */
  async createOrUpdateRelease(
    tagName: string,
    body: string,
    options: {
      draft?: boolean;
      prerelease?: boolean;
      name?: string;
    } = {}
  ): Promise<string> {
    const exists = await this.releaseExists(tagName);

    if (exists) {
      return this.updateRelease(tagName, body, options);
    } else {
      return this.createRelease(tagName, body, options);
    }
  }

  /**
   * Delete a GitHub Release
   */
  async deleteRelease(tagName: string): Promise<void> {
    core.info(`Deleting GitHub Release: ${tagName}`);

    const { data: release } = await this.octokit.rest.repos.getReleaseByTag({
      owner: this.owner,
      repo: this.repo,
      tag: tagName,
    });

    await this.octokit.rest.repos.deleteRelease({
      owner: this.owner,
      repo: this.repo,
      release_id: release.id,
    });

    core.info(`✓ GitHub Release deleted: ${tagName}`);
  }
}
