"use strict";
/**
 * Utility functions for release notes generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidSemver = isValidSemver;
exports.extractVersion = extractVersion;
exports.formatDate = formatDate;
exports.parseRepoUrl = parseRepoUrl;
exports.generateCompareUrl = generateCompareUrl;
exports.isPrereleaseVersion = isPrereleaseVersion;
exports.sleep = sleep;
/**
 * Check if a version string is valid Semantic Versioning format
 * @param version - Version string to validate
 * @returns True if valid, false otherwise
 */
function isValidSemver(version) {
    const semverRegex = /^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/;
    return semverRegex.test(version);
}
/**
 * Extract version from a tag name
 * @param tag - Git tag name (e.g., "v1.0.0", "refs/tags/v1.0.0")
 * @returns Extracted version string (e.g., "v1.0.0")
 */
function extractVersion(tag) {
    // Remove refs/tags/ prefix if present
    const cleanTag = tag.replace(/^refs\/tags\//, '');
    return cleanTag;
}
/**
 * Format date to YYYY-MM-DD
 * @param date - Date object to format
 * @returns Formatted date string
 */
function formatDate(date) {
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
function parseRepoUrl(url) {
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
function generateCompareUrl(owner, repo, previousVersion, currentVersion) {
    return `https://github.com/${owner}/${repo}/compare/${previousVersion}...${currentVersion}`;
}
/**
 * Check if version is a prerelease
 * @param version - Version string
 * @returns True if prerelease, false otherwise
 */
function isPrereleaseVersion(version) {
    return /-alpha|-beta|-rc|-pre/.test(version);
}
/**
 * Sleep for specified milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the delay
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=utils.js.map