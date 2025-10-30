/**
 * Utility functions for release notes generation
 */
/**
 * Check if a version string is valid Semantic Versioning format
 * @param version - Version string to validate
 * @returns True if valid, false otherwise
 */
export declare function isValidSemver(version: string): boolean;
/**
 * Extract version from a tag name
 * @param tag - Git tag name (e.g., "v1.0.0", "refs/tags/v1.0.0")
 * @returns Extracted version string (e.g., "v1.0.0")
 */
export declare function extractVersion(tag: string): string;
/**
 * Format date to YYYY-MM-DD
 * @param date - Date object to format
 * @returns Formatted date string
 */
export declare function formatDate(date: Date): string;
/**
 * Parse repository URL to extract owner and repo name
 * @param url - GitHub repository URL
 * @returns Object with owner and repo
 */
export declare function parseRepoUrl(url: string): {
    owner: string;
    repo: string;
};
/**
 * Generate GitHub compare URL
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param previousVersion - Previous version tag
 * @param currentVersion - Current version tag
 * @returns Compare URL
 */
export declare function generateCompareUrl(owner: string, repo: string, previousVersion: string, currentVersion: string): string;
/**
 * Check if version is a prerelease
 * @param version - Version string
 * @returns True if prerelease, false otherwise
 */
export declare function isPrereleaseVersion(version: string): boolean;
/**
 * Sleep for specified milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the delay
 */
export declare function sleep(ms: number): Promise<void>;
