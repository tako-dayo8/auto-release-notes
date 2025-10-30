/**
 * CHANGELOG writer
 */
import type { ReleaseData } from './types';
/**
 * Generate release notes content
 */
export declare function generateReleaseNotes(data: ReleaseData): string;
/**
 * Write content to CHANGELOG.md
 */
export declare function writeChangelog(filePath: string, newContent: string, dryRun?: boolean): Promise<void>;
/**
 * Write version-specific changelog file
 */
export declare function writeVersionFile(version: string, content: string, dryRun?: boolean): Promise<void>;
