/**
 * Unit tests for utility functions
 */

import {
  isValidSemver,
  extractVersion,
  formatDate,
  parseRepoUrl,
  generateCompareUrl,
  isPrereleaseVersion,
  sleep,
} from '../../src/utils';

describe('isValidSemver', () => {
  describe('valid versions', () => {
    test('accepts version with v prefix', () => {
      expect(isValidSemver('v1.0.0')).toBe(true);
      expect(isValidSemver('v2.3.5')).toBe(true);
      expect(isValidSemver('v10.20.30')).toBe(true);
    });

    test('accepts version without v prefix', () => {
      expect(isValidSemver('1.0.0')).toBe(true);
      expect(isValidSemver('2.3.5')).toBe(true);
    });

    test('accepts prerelease versions', () => {
      expect(isValidSemver('v1.0.0-alpha')).toBe(true);
      expect(isValidSemver('v1.0.0-beta.1')).toBe(true);
      expect(isValidSemver('v2.0.0-rc.1')).toBe(true);
      expect(isValidSemver('1.0.0-pre.1')).toBe(true);
    });

    test('accepts build metadata', () => {
      expect(isValidSemver('v1.0.0-alpha.1')).toBe(true);
      expect(isValidSemver('1.2.3-beta.11.e2f4g5')).toBe(true);
    });
  });

  describe('invalid versions', () => {
    test('rejects incomplete versions', () => {
      expect(isValidSemver('1.0')).toBe(false);
      expect(isValidSemver('v1')).toBe(false);
      expect(isValidSemver('')).toBe(false);
    });

    test('rejects non-numeric versions', () => {
      expect(isValidSemver('version-1.0.0')).toBe(false);
      expect(isValidSemver('release-1.0.0')).toBe(false);
      expect(isValidSemver('invalid')).toBe(false);
    });

    test('rejects extra components', () => {
      expect(isValidSemver('v1.0.0.0')).toBe(false);
    });
  });
});

describe('extractVersion', () => {
  test('extracts version from simple tag', () => {
    expect(extractVersion('v1.0.0')).toBe('v1.0.0');
    expect(extractVersion('v2.3.5')).toBe('v2.3.5');
  });

  test('removes refs/tags/ prefix', () => {
    expect(extractVersion('refs/tags/v1.0.0')).toBe('v1.0.0');
    expect(extractVersion('refs/tags/v2.3.5-beta.1')).toBe('v2.3.5-beta.1');
  });

  test('handles tags without prefix', () => {
    expect(extractVersion('1.0.0')).toBe('1.0.0');
  });

  test('preserves prerelease identifiers', () => {
    expect(extractVersion('refs/tags/v1.0.0-alpha')).toBe('v1.0.0-alpha');
    expect(extractVersion('v2.0.0-rc.1')).toBe('v2.0.0-rc.1');
  });
});

describe('formatDate', () => {
  test('formats date to YYYY-MM-DD', () => {
    const date = new Date('2025-01-31T10:30:00Z');
    expect(formatDate(date)).toBe('2025-01-31');
  });

  test('pads single digit month and day', () => {
    const date = new Date('2025-03-05T10:30:00Z');
    expect(formatDate(date)).toBe('2025-03-05');
  });

  test('handles leap year dates', () => {
    const date = new Date('2024-02-29T10:30:00Z');
    expect(formatDate(date)).toBe('2024-02-29');
  });

  test('handles end of year', () => {
    // Use local time to avoid timezone issues
    const date = new Date(2025, 11, 31); // Month is 0-indexed
    expect(formatDate(date)).toBe('2025-12-31');
  });
});

describe('parseRepoUrl', () => {
  test('parses HTTPS URL', () => {
    const result = parseRepoUrl('https://github.com/owner/repo');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });

  test('parses HTTPS URL with .git suffix', () => {
    const result = parseRepoUrl('https://github.com/owner/repo.git');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });

  test('parses SSH URL', () => {
    const result = parseRepoUrl('git@github.com:owner/repo.git');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });

  test('parses SSH URL without .git', () => {
    const result = parseRepoUrl('git@github.com:owner/repo');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });

  test('handles organization names with hyphens', () => {
    const result = parseRepoUrl('https://github.com/my-org/my-repo');
    expect(result).toEqual({ owner: 'my-org', repo: 'my-repo' });
  });

  test('throws error for invalid URL', () => {
    expect(() => parseRepoUrl('invalid-url')).toThrow('Invalid GitHub repository URL');
    expect(() => parseRepoUrl('https://gitlab.com/owner/repo')).toThrow('Invalid GitHub repository URL');
  });
});

describe('generateCompareUrl', () => {
  test('generates compare URL', () => {
    const url = generateCompareUrl('owner', 'repo', 'v1.0.0', 'v1.1.0');
    expect(url).toBe('https://github.com/owner/repo/compare/v1.0.0...v1.1.0');
  });

  test('handles prerelease versions', () => {
    const url = generateCompareUrl('owner', 'repo', 'v1.0.0-beta.1', 'v1.0.0-beta.2');
    expect(url).toBe('https://github.com/owner/repo/compare/v1.0.0-beta.1...v1.0.0-beta.2');
  });

  test('handles different owner and repo names', () => {
    const url = generateCompareUrl('my-org', 'my-repo', 'v2.0.0', 'v3.0.0');
    expect(url).toBe('https://github.com/my-org/my-repo/compare/v2.0.0...v3.0.0');
  });
});

describe('isPrereleaseVersion', () => {
  test('detects alpha versions', () => {
    expect(isPrereleaseVersion('v1.0.0-alpha')).toBe(true);
    expect(isPrereleaseVersion('v1.0.0-alpha.1')).toBe(true);
  });

  test('detects beta versions', () => {
    expect(isPrereleaseVersion('v1.0.0-beta')).toBe(true);
    expect(isPrereleaseVersion('v1.0.0-beta.2')).toBe(true);
  });

  test('detects rc versions', () => {
    expect(isPrereleaseVersion('v1.0.0-rc')).toBe(true);
    expect(isPrereleaseVersion('v1.0.0-rc.1')).toBe(true);
  });

  test('detects pre versions', () => {
    expect(isPrereleaseVersion('v1.0.0-pre')).toBe(true);
    expect(isPrereleaseVersion('v1.0.0-pre.1')).toBe(true);
  });

  test('returns false for stable versions', () => {
    expect(isPrereleaseVersion('v1.0.0')).toBe(false);
    expect(isPrereleaseVersion('v2.3.5')).toBe(false);
    expect(isPrereleaseVersion('1.0.0')).toBe(false);
  });
});

describe('sleep', () => {
  test('delays execution', async () => {
    const start = Date.now();
    await sleep(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(95); // Allow small variance
    expect(elapsed).toBeLessThan(150);
  });

  test('returns a promise', () => {
    const result = sleep(0);
    expect(result).toBeInstanceOf(Promise);
  });

  test('can be awaited', async () => {
    await expect(sleep(10)).resolves.toBeUndefined();
  });
});
