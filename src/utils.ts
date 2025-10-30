/**
 * Utility functions for release notes generation
 */

/**
 * Check if a version string is valid Semantic Versioning format
 * @param version - Version string to validate
 * @returns True if valid, false otherwise
 */
export function isValidSemver(version: string): boolean {
  const semverRegex = /^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/;
  return semverRegex.test(version);
}

/**
 * Extract version from a tag name
 * @param tag - Git tag name (e.g., "v1.0.0", "refs/tags/v1.0.0")
 * @returns Extracted version string (e.g., "v1.0.0")
 */
export function extractVersion(tag: string): string {
  // Remove refs/tags/ prefix if present
  const cleanTag = tag.replace(/^refs\/tags\//, '');
  return cleanTag;
}

/**
 * Format date to YYYY-MM-DD
 * @param date - Date object to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse repository URL to extract owner and repo name
 * @param url - GitHub repository URL
 * @returns Object with owner and repo
 */
export function parseRepoUrl(url: string): { owner: string; repo: string } {
  // Handle different URL formats
  // https://github.com/owner/repo
  // git@github.com:owner/repo.git
  const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  if (!match) {
    throw new Error(`Invalid GitHub repository URL: ${url}`);
  }
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  };
}

/**
 * Generate GitHub compare URL
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param previousVersion - Previous version tag
 * @param currentVersion - Current version tag
 * @returns Compare URL
 */
export function generateCompareUrl(
  owner: string,
  repo: string,
  previousVersion: string,
  currentVersion: string
): string {
  return `https://github.com/${owner}/${repo}/compare/${previousVersion}...${currentVersion}`;
}

/**
 * Check if version is a prerelease
 * @param version - Version string
 * @returns True if prerelease, false otherwise
 */
export function isPrereleaseVersion(version: string): boolean {
  return /-alpha|-beta|-rc|-pre/.test(version);
}

/**
 * Sleep for specified milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
