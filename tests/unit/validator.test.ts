/**
 * Unit tests for input validation
 */

import {
  validateTagFormat,
  validateTemplate,
  validateFilePath,
  validateGitHubToken,
  validateBoolean,
  validateExcludeLabels,
  validateInputs,
} from '../../src/validator';

// Mock dependencies
jest.mock('@actions/core');
jest.mock('../../src/logger');
jest.mock('../../src/templates', () => ({
  getAvailableTemplates: () => ['standard', 'detailed', 'minimal'],
}));

// Mock fs/promises
jest.mock('fs/promises', () => ({
  access: jest.fn(),
}));

describe('validateTagFormat', () => {
  test('accepts valid semver tags', () => {
    const result = validateTagFormat('v1.0.0');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('accepts prerelease versions', () => {
    const result = validateTagFormat('v1.0.0-beta.1');
    expect(result.valid).toBe(true);
  });

  test('rejects invalid tag format', () => {
    const result = validateTagFormat('invalid');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Invalid tag format');
  });

  test('rejects incomplete versions', () => {
    const result = validateTagFormat('v1.0');
    expect(result.valid).toBe(false);
  });
});

describe('validateTemplate', () => {
  test('accepts valid template names', () => {
    expect(validateTemplate('standard').valid).toBe(true);
    expect(validateTemplate('detailed').valid).toBe(true);
    expect(validateTemplate('minimal').valid).toBe(true);
  });

  test('is case insensitive', () => {
    expect(validateTemplate('STANDARD').valid).toBe(true);
    expect(validateTemplate('Detailed').valid).toBe(true);
  });

  test('rejects invalid template names', () => {
    const result = validateTemplate('invalid');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Invalid template');
  });

  test('provides list of available templates in error', () => {
    const result = validateTemplate('invalid');
    expect(result.errors[0]).toContain('standard');
    expect(result.errors[0]).toContain('detailed');
    expect(result.errors[0]).toContain('minimal');
  });
});

describe('validateFilePath', () => {
  const fs = require('fs/promises');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns valid when directory exists', async () => {
    fs.access.mockResolvedValue(undefined);

    const result = await validateFilePath('docs/CHANGELOG.md');
    expect(result.valid).toBe(true);
  });

  test('warns when directory does not exist', async () => {
    fs.access.mockRejectedValue(new Error('ENOENT'));

    const result = await validateFilePath('nonexistent/CHANGELOG.md');
    expect(result.valid).toBe(true); // Still valid, just a warning
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  test('handles file in root directory', async () => {
    const result = await validateFilePath('CHANGELOG.md');
    expect(result.valid).toBe(true);
  });
});

describe('validateGitHubToken', () => {
  test('accepts valid token', () => {
    const result = validateGitHubToken('ghp_1234567890abcdefghijklmnopqrstuv');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('rejects empty token', () => {
    const result = validateGitHubToken('');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('GitHub token is required');
  });

  test('rejects whitespace-only token', () => {
    const result = validateGitHubToken('   ');
    expect(result.valid).toBe(false);
  });

  test('rejects token that is too short', () => {
    const result = validateGitHubToken('short');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('too short');
  });
});

describe('validateBoolean', () => {
  test('accepts true', () => {
    const result = validateBoolean('true', 'test-param');
    expect(result.valid).toBe(true);
  });

  test('accepts false', () => {
    const result = validateBoolean('false', 'test-param');
    expect(result.valid).toBe(true);
  });

  test('accepts empty string', () => {
    const result = validateBoolean('', 'test-param');
    expect(result.valid).toBe(true);
  });

  test('rejects invalid boolean values', () => {
    const result = validateBoolean('yes', 'test-param');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Invalid boolean value');
    expect(result.errors[0]).toContain('test-param');
  });

  test('rejects numeric values', () => {
    expect(validateBoolean('1', 'test').valid).toBe(false);
    expect(validateBoolean('0', 'test').valid).toBe(false);
  });
});

describe('validateExcludeLabels', () => {
  test('accepts comma-separated labels', () => {
    const result = validateExcludeLabels('skip-changelog,no-changelog');
    expect(result.valid).toBe(true);
  });

  test('accepts single label', () => {
    const result = validateExcludeLabels('skip-changelog');
    expect(result.valid).toBe(true);
  });

  test('accepts empty string', () => {
    const result = validateExcludeLabels('');
    expect(result.valid).toBe(true);
  });

  test('handles whitespace', () => {
    const result = validateExcludeLabels('skip-changelog, no-changelog');
    expect(result.valid).toBe(true);
  });
});

describe('validateInputs', () => {
  const fs = require('fs/promises');

  beforeEach(() => {
    jest.clearAllMocks();
    fs.access.mockResolvedValue(undefined);
  });

  test('validates all inputs successfully', async () => {
    const inputs = {
      version: 'v1.0.0',
      template: 'standard',
      changelogFile: 'CHANGELOG.md',
      token: 'ghp_1234567890abcdefghijklmnopqrstuv',
      versionFile: 'true',
      createGithubRelease: 'true',
      dryRun: 'false',
      excludeLabels: 'skip-changelog',
    };

    const result = await validateInputs(inputs);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('collects all errors from failed validations', async () => {
    const inputs = {
      version: 'invalid',
      template: 'invalid',
      changelogFile: 'CHANGELOG.md',
      token: '',
      versionFile: 'invalid',
      createGithubRelease: 'true',
      dryRun: 'false',
      excludeLabels: '',
    };

    const result = await validateInputs(inputs);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(2); // Multiple errors
  });

  test('includes warnings in result', async () => {
    fs.access.mockRejectedValue(new Error('ENOENT'));

    const inputs = {
      version: 'v1.0.0',
      template: 'standard',
      changelogFile: 'nonexistent/CHANGELOG.md',
      token: 'ghp_1234567890abcdefghijklmnopqrstuv',
      versionFile: 'true',
      createGithubRelease: 'true',
      dryRun: 'false',
      excludeLabels: '',
    };

    const result = await validateInputs(inputs);
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  test('validates boolean inputs', async () => {
    const inputs = {
      version: 'v1.0.0',
      template: 'standard',
      changelogFile: 'CHANGELOG.md',
      token: 'ghp_1234567890abcdefghijklmnopqrstuv',
      versionFile: 'yes', // Invalid
      createGithubRelease: 'true',
      dryRun: 'false',
      excludeLabels: '',
    };

    const result = await validateInputs(inputs);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('version-file'))).toBe(true);
  });
});
