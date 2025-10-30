/**
 * GitHub Releases management
 */
export declare class ReleasesManager {
    private octokit;
    private owner;
    private repo;
    constructor(token: string, owner: string, repo: string);
    /**
     * Check if a release already exists for a tag
     */
    releaseExists(tagName: string): Promise<boolean>;
    /**
     * Create a GitHub Release
     */
    createRelease(tagName: string, body: string, options?: {
        draft?: boolean;
        prerelease?: boolean;
        name?: string;
    }): Promise<string>;
    /**
     * Update an existing GitHub Release
     */
    updateRelease(tagName: string, body: string, options?: {
        draft?: boolean;
        prerelease?: boolean;
        name?: string;
    }): Promise<string>;
    /**
     * Create or update a GitHub Release
     */
    createOrUpdateRelease(tagName: string, body: string, options?: {
        draft?: boolean;
        prerelease?: boolean;
        name?: string;
    }): Promise<string>;
    /**
     * Delete a GitHub Release
     */
    deleteRelease(tagName: string): Promise<void>;
}
