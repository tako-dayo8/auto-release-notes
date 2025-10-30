"use strict";
/**
 * GitHub Releases management
 */
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
exports.ReleasesManager = void 0;
const github_1 = require("@actions/github");
const core = __importStar(require("@actions/core"));
const utils_1 = require("./utils");
class ReleasesManager {
    octokit;
    owner;
    repo;
    constructor(token, owner, repo) {
        this.octokit = (0, github_1.getOctokit)(token);
        this.owner = owner;
        this.repo = repo;
    }
    /**
     * Check if a release already exists for a tag
     */
    async releaseExists(tagName) {
        try {
            await this.octokit.rest.repos.getReleaseByTag({
                owner: this.owner,
                repo: this.repo,
                tag: tagName,
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Create a GitHub Release
     */
    async createRelease(tagName, body, options = {}) {
        const { draft = false, prerelease = (0, utils_1.isPrereleaseVersion)(tagName), name = `Release ${tagName}`, } = options;
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
    async updateRelease(tagName, body, options = {}) {
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
    async createOrUpdateRelease(tagName, body, options = {}) {
        const exists = await this.releaseExists(tagName);
        if (exists) {
            return this.updateRelease(tagName, body, options);
        }
        else {
            return this.createRelease(tagName, body, options);
        }
    }
    /**
     * Delete a GitHub Release
     */
    async deleteRelease(tagName) {
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
exports.ReleasesManager = ReleasesManager;
//# sourceMappingURL=releases.js.map