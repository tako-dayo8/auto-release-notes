# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript-based GitHub Action that automatically generates release notes from PRs, commits, and issues. It triggers on tag pushes following Semantic Versioning (e.g., `v1.0.0`) and collects information from commits, PRs, and issues to create structured changelog entries.

## Commands

### Build & Development
```bash
npm run build          # Compile TypeScript and bundle with ncc
npm test              # Run Jest tests
npm test:watch        # Run tests in watch mode
npm test:coverage     # Run tests with coverage report
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

### Testing Single Files
```bash
npx jest path/to/test-file.ts    # Run specific test file
npx jest -t "test name"          # Run tests matching pattern
```

## Architecture

### Core Pipeline Flow
The action follows a sequential pipeline in `src/main.ts`:

1. **Input Validation** (`validator.ts`) - Validates version format, template name, and input parameters
2. **Information Collection** (`collector.ts`) - Fetches tags, commits, PRs, and issues via GitHub API with pagination support
3. **Filtering** (`filter.ts`) - Excludes chore commits and optionally merge commits based on configuration
4. **Parsing** (`parser.ts`) - Parses commits using Conventional Commits format (e.g., `feat:`, `fix:`)
5. **Categorization** (`categorizer.ts`) - Groups changes into categories (Features, Bug Fixes, Breaking Changes, etc.)
6. **Contributor Extraction** (`contributors.ts`) - Extracts and deduplicates contributors, filters out bots
7. **Template Rendering** (`templates/`) - Generates markdown using selected template (standard/detailed/minimal)
8. **Output Writing** (`writer.ts`) - Writes to CHANGELOG.md and version-specific files
9. **Release Creation** (`releases.ts`) - Creates GitHub Release via API

### Key Components

**Collector** (`collector.ts`): Handles all GitHub API interactions with pagination. Methods include:
- `getTags()` - Fetches repository tags
- `getCommitsBetweenTags()` - Gets commits between two tag SHAs with pagination
- `getMergedPRs()` - Fetches merged PRs since a date
- `extractClosedIssues()` - Parses PR bodies for issue references (Closes #123, Fixes #456)

**Parser** (`parser.ts`): Uses `conventional-commits-parser` to extract structured data from commit messages:
- Identifies commit type (feat, fix, docs, etc.)
- Extracts scope and subject
- Detects breaking changes from `BREAKING CHANGE:` footer or `!` suffix

**Categorizer** (`categorizer.ts`): Maps parsed commits to changelog categories:
- Breaking Changes → `changes.breaking`
- feat → `changes.features`
- fix → `changes.bugFixes`
- docs → `changes.documentation`
- perf → `changes.performance`
- Other types → respective categories

**Templates** (`templates/`): Three template implementations extending base `Template` interface:
- `StandardTemplate` - Standard format with emoji icons and categories
- `DetailedTemplate` - Includes commit hashes, PR numbers, and detailed contributor info
- `MinimalTemplate` - Simplified format without categories

**Retry Logic** (`retry.ts`): Implements `withGitHubRetry()` wrapper with exponential backoff for GitHub API calls (3 retries with delays: 1s, 2s, 4s)

**Logger** (`logger.ts`): Provides structured logging with sections, using GitHub Actions core logging

### Type System
All types are centrally defined in `types.ts`:
- `ParsedCommit` - Commit with conventional commits fields
- `CategorizedChanges` - Object with arrays for each category
- `ReleaseData` - Complete data structure passed to templates
- `ChangeItem` - Individual change entry with metadata

### Data Flow
```
GitHub API → Collector → ParsedCommit[] → Filter → Parser →
CategorizedChanges → ReleaseData → Template → Markdown →
Writer (CHANGELOG.md + version files) + Releases (GitHub Release)
```

## Configuration

The action is configured via `action.yml` inputs. Key inputs:
- `github-token` - Required for API access
- `template` - Template preset: standard, detailed, minimal
- `changelog-file` - Output path (default: CHANGELOG.md)
- `version-file` - Enable individual version files in changelog/ directory
- `create-github-release` - Create GitHub Release (default: true)
- `exclude-labels` - Labels to exclude from changelog (default: skip-changelog,no-changelog)
- `dry-run` - Preview mode without making changes

## Important Implementation Details

### Version Detection
Versions are extracted from Git tags using `extractVersion()` in `utils.ts`. Tags must start with `v` and follow Semantic Versioning (e.g., `v1.2.3`, `v1.0.0-beta.1`).

### Commit Range Selection
The action finds the current tag in the list of all tags, then uses the next tag in the list as the "previous tag" to determine the commit range. For the first release, all commits are included.

### Breaking Change Detection
Breaking changes are detected via:
1. Conventional Commits footer: `BREAKING CHANGE: description`
2. Type with `!` suffix: `feat!: breaking feature`

### Bot Filtering
Contributors are filtered to exclude bots based on naming patterns (e.g., usernames ending in `[bot]` or matching `dependabot`, `renovate`, etc.).

### GitHub API Rate Limiting
The collector uses pagination (100 items per page) and the retry mechanism handles rate limiting with exponential backoff. Authenticated requests have 5000 requests/hour limit.

## Workflow Integration

Typical workflow usage requires:
- Triggering on tag push (`on.push.tags: ['v*.*.*']`)
- Checking out with full git history (`fetch-depth: 0`)
- Permissions: `contents: write`, `pull-requests: read`, `issues: read`

## File Organization

Core modules by responsibility:
- Entry point: `main.ts`
- Data collection: `collector.ts`
- Processing: `parser.ts`, `categorizer.ts`, `filter.ts`, `contributors.ts`
- Output: `writer.ts`, `releases.ts`, `templates/`
- Utilities: `utils.ts`, `logger.ts`, `retry.ts`, `validator.ts`
- Types: `types.ts`
