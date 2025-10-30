"use strict";
/**
 * CHANGELOG writer
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
exports.generateReleaseNotes = generateReleaseNotes;
exports.writeChangelog = writeChangelog;
exports.writeVersionFile = writeVersionFile;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const core = __importStar(require("@actions/core"));
/**
 * Category display names and emojis
 */
const CATEGORY_DISPLAY = {
    breaking: { emoji: '🚨', title: 'Breaking Changes' },
    features: { emoji: '✨', title: 'Features' },
    bugFixes: { emoji: '🐛', title: 'Bug Fixes' },
    documentation: { emoji: '📚', title: 'Documentation' },
    performance: { emoji: '⚡', title: 'Performance' },
    refactoring: { emoji: '🔧', title: 'Refactoring' },
    style: { emoji: '🎨', title: 'Style' },
    tests: { emoji: '✅', title: 'Tests' },
    build: { emoji: '🔨', title: 'Build System' },
    ci: { emoji: '🤖', title: 'CI/CD' },
    other: { emoji: '📦', title: 'Other Changes' },
};
/**
 * Format a change item
 */
function formatChangeItem(item, owner, repo) {
    let line = `- ${item.description}`;
    if (item.prNumber) {
        line += ` ([#${item.prNumber}](https://github.com/${owner}/${repo}/pull/${item.prNumber}))`;
    }
    if (item.author) {
        line += ` @${item.author}`;
    }
    return line;
}
/**
 * Format a category section
 */
function formatCategory(categoryKey, items, owner, repo) {
    if (items.length === 0)
        return '';
    const display = CATEGORY_DISPLAY[categoryKey] || {
        emoji: '📦',
        title: 'Other Changes',
    };
    let section = `\n### ${display.emoji} ${display.title}\n\n`;
    for (const item of items) {
        section += formatChangeItem(item, owner, repo) + '\n';
    }
    return section;
}
/**
 * Generate release notes content
 */
function generateReleaseNotes(data) {
    let content = `## [${data.version}] - ${data.date}\n`;
    // Add categories in order
    const categories = [
        'breaking',
        'features',
        'bugFixes',
        'documentation',
        'performance',
        'refactoring',
        'style',
        'tests',
        'build',
        'ci',
        'other',
    ];
    for (const category of categories) {
        const items = data.changes[category];
        content += formatCategory(category, items, data.owner, data.repo);
    }
    // Add contributors
    if (data.contributors.length > 0) {
        content += `\n### Contributors\n\n`;
        content += data.contributors.map((c) => `@${c}`).join(', ') + '\n';
    }
    // Add compare URL
    if (data.compareUrl) {
        content += `\n**Full Changelog**: ${data.compareUrl}\n`;
    }
    return content;
}
/**
 * Write content to CHANGELOG.md
 */
async function writeChangelog(filePath, newContent, dryRun = false) {
    if (dryRun) {
        core.info(`[DRY RUN] Would write to: ${filePath}`);
        core.info('----------------------------------------');
        core.info(newContent);
        core.info('----------------------------------------');
        return;
    }
    let existingContent = '';
    // Read existing changelog if it exists
    try {
        existingContent = await fs.readFile(filePath, 'utf-8');
    }
    catch (error) {
        core.debug(`CHANGELOG file not found, creating new one: ${filePath}`);
    }
    // Combine new and existing content
    let finalContent;
    if (existingContent) {
        // Insert new content after the title (if exists) or at the beginning
        const lines = existingContent.split('\n');
        const titleIndex = lines.findIndex((line) => line.startsWith('# '));
        if (titleIndex >= 0) {
            // Insert after title
            lines.splice(titleIndex + 1, 0, '\n' + newContent);
            finalContent = lines.join('\n');
        }
        else {
            // Insert at beginning
            finalContent = newContent + '\n\n' + existingContent;
        }
    }
    else {
        // Create new changelog with title
        finalContent = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${newContent}`;
    }
    // Write to file
    await fs.writeFile(filePath, finalContent, 'utf-8');
    core.info(`✓ Written to ${filePath}`);
}
/**
 * Write version-specific changelog file
 */
async function writeVersionFile(version, content, dryRun = false) {
    const dirPath = 'changelog';
    const fileName = `${version.replace(/^v/, '')}.md`;
    const filePath = path.join(dirPath, fileName);
    if (dryRun) {
        core.info(`[DRY RUN] Would write to: ${filePath}`);
        return;
    }
    // Create directory if it doesn't exist
    try {
        await fs.mkdir(dirPath, { recursive: true });
    }
    catch (error) {
        // Directory might already exist
    }
    // Write version file
    await fs.writeFile(filePath, content, 'utf-8');
    core.info(`✓ Written to ${filePath}`);
}
//# sourceMappingURL=writer.js.map