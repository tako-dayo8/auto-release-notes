/**
 * Input validation
 */

import * as fs from 'fs/promises';
import * as core from '@actions/core';
import { isValidSemver } from './utils';
import { getAvailableTemplates } from './templates';
import * as logger from './logger';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Create empty validation result
 */
function createValidationResult(): ValidationResult {
  return {
    valid: true,
    errors: [],
    warnings: [],
  };
}

/**
 * Validate tag format
 */
export function validateTagFormat(tag: string): ValidationResult {
  const result = createValidationResult();

  if (!isValidSemver(tag)) {
    result.valid = false;
    result.errors.push(
      `Invalid tag format: '${tag}'. Expected Semantic Versioning (e.g., v1.2.3, v2.0.0-beta.1)`
    );
  } else {
    logger.validation(true, `Valid Semantic Versioning tag: ${tag}`);
  }

  return result;
}

/**
 * Validate template name
 */
export function validateTemplate(template: string): ValidationResult {
  const result = createValidationResult();
  const available = getAvailableTemplates();

  if (!available.includes(template.toLowerCase())) {
    result.valid = false;
    result.errors.push(
      `Invalid template: '${template}'. Available templates: ${available.join(', ')}`
    );
  } else {
    logger.validation(true, `Template '${template}' is valid`);
  }

  return result;
}

/**
 * Validate file path
 */
export async function validateFilePath(filePath: string): Promise<ValidationResult> {
  const result = createValidationResult();

  try {
    // Check if parent directory exists
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    if (dir) {
      try {
        await fs.access(dir);
        logger.validation(true, `Directory '${dir}' exists`);
      } catch {
        result.warnings.push(`Directory '${dir}' does not exist, will be created`);
      }
    }
  } catch (error) {
    result.warnings.push(`Could not validate file path: ${filePath}`);
  }

  return result;
}

/**
 * Validate GitHub token permissions (basic check)
 */
export function validateGitHubToken(token: string): ValidationResult {
  const result = createValidationResult();

  if (!token || token.trim() === '') {
    result.valid = false;
    result.errors.push('GitHub token is required');
    return result;
  }

  if (token.length < 20) {
    result.valid = false;
    result.errors.push('GitHub token appears to be invalid (too short)');
    return result;
  }

  logger.validation(true, 'GitHub token is provided');
  return result;
}

/**
 * Validate boolean input
 */
export function validateBoolean(value: string, name: string): ValidationResult {
  const result = createValidationResult();

  if (value !== 'true' && value !== 'false' && value !== '') {
    result.valid = false;
    result.errors.push(`Invalid boolean value for '${name}': '${value}'. Expected 'true' or 'false'`);
  }

  return result;
}

/**
 * Validate exclude labels format
 */
export function validateExcludeLabels(labels: string): ValidationResult {
  const result = createValidationResult();

  if (labels && labels.trim() !== '') {
    const labelList = labels.split(',').map((s) => s.trim());

    if (labelList.length > 0) {
      logger.validation(true, `Exclude labels: ${labelList.join(', ')}`);
    }
  }

  return result;
}

/**
 * Run all validations
 */
export async function validateInputs(inputs: {
  version: string;
  template: string;
  changelogFile: string;
  token: string;
  versionFile: string;
  createGithubRelease: string;
  dryRun: string;
  excludeLabels: string;
}): Promise<ValidationResult> {
  logger.section('Input Validation');

  const results: ValidationResult[] = [];

  // Validate tag format
  results.push(validateTagFormat(inputs.version));

  // Validate template
  results.push(validateTemplate(inputs.template));

  // Validate file path
  results.push(await validateFilePath(inputs.changelogFile));

  // Validate token
  results.push(validateGitHubToken(inputs.token));

  // Validate boolean inputs
  results.push(validateBoolean(inputs.versionFile, 'version-file'));
  results.push(validateBoolean(inputs.createGithubRelease, 'create-github-release'));
  results.push(validateBoolean(inputs.dryRun, 'dry-run'));

  // Validate exclude labels
  results.push(validateExcludeLabels(inputs.excludeLabels));

  // Merge all results
  const finalResult: ValidationResult = {
    valid: results.every((r) => r.valid),
    errors: results.flatMap((r) => r.errors),
    warnings: results.flatMap((r) => r.warnings),
  };

  // Log errors and warnings
  for (const error of finalResult.errors) {
    core.error(error);
  }

  for (const warning of finalResult.warnings) {
    core.warning(warning);
  }

  if (finalResult.valid) {
    logger.success('All input validations passed');
  } else {
    logger.error('Input validation failed');
  }

  return finalResult;
}
