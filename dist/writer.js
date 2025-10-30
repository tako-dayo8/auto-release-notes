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
const templates_1 = require("./templates");
/**
 * Generate release notes content using template
 */
function generateReleaseNotes(data, templateName = 'standard') {
    const template = (0, templates_1.getTemplate)(templateName);
    return template.generate(data);
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