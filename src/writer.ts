/**
 * CHANGELOG writer
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as core from '@actions/core';
import type { ReleaseData } from './types';
import { getTemplate } from './templates';

/**
 * Generate release notes content using template
 */
export function generateReleaseNotes(data: ReleaseData, templateName = 'standard'): string {
  const template = getTemplate(templateName);
  return template.generate(data);
}

/**
 * Write content to CHANGELOG.md
 */
export async function writeChangelog(
  filePath: string,
  newContent: string,
  dryRun = false
): Promise<void> {
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
  } catch (error) {
    core.debug(`CHANGELOG file not found, creating new one: ${filePath}`);
  }

  // Combine new and existing content
  let finalContent: string;

  if (existingContent) {
    // Insert new content after the title (if exists) or at the beginning
    const lines = existingContent.split('\n');
    const titleIndex = lines.findIndex((line) => line.startsWith('# '));

    if (titleIndex >= 0) {
      // Insert after title
      lines.splice(titleIndex + 1, 0, '\n' + newContent);
      finalContent = lines.join('\n');
    } else {
      // Insert at beginning
      finalContent = newContent + '\n\n' + existingContent;
    }
  } else {
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
export async function writeVersionFile(
  version: string,
  content: string,
  dryRun = false
): Promise<void> {
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
  } catch (error) {
    // Directory might already exist
  }

  // Write version file
  await fs.writeFile(filePath, content, 'utf-8');
  core.info(`✓ Written to ${filePath}`);
}
