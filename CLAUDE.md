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

## Project Status

### Current Release: v1.0.0
- **Repository**: https://github.com/tako-dayo8/auto-release-notes
- **Released**: 2025-10-31
- **Status**: Production-ready, publicly available

### Testing
- **Test Suite**: 188 unit tests (all passing)
- **Coverage**: 99.32% (exceeding 80% target)
- **Test Files**: Located in `tests/unit/`
  - `utils.test.ts` - Version validation, date formatting, URL parsing
  - `parser.test.ts` - Conventional Commits parsing
  - `categorizer.test.ts` - Change categorization logic
  - `filter.test.ts` - Filtering chore/merge commits
  - `contributors.test.ts` - Bot detection and contributor extraction
  - `validator.test.ts` - Input validation
  - `logger.test.ts` - Logging functionality

### Documentation
- **README.md** - Comprehensive English documentation
- **README_JP.md** - Japanese translation
- **CONTRIBUTING.md** - Development guidelines and contribution process
- **examples/** - 7 workflow examples demonstrating various use cases
  - Basic usage, custom templates, exclusions, dry-run, prerelease, custom paths, etc.

### CI/CD
All workflows are configured and passing:
- **Test Workflow** (`.github/workflows/test.yml`)
  - Multi-OS: Ubuntu, Windows, macOS
  - Multi-version: Node.js 18.x, 20.x
  - Codecov integration enabled
- **Lint Workflow** (`.github/workflows/lint.yml`)
  - ESLint, Prettier, TypeScript compilation checks
- **Release Workflow** (`.github/workflows/release.yml`)
  - Dogfooding: Uses the action itself to generate release notes
  - Triggered on tag push (v*.*.*)
  - **Automated major version tag update**:
    - Extracts major version from tag (e.g., v1.2.3 → v1)
    - Creates or force-updates major version tag
    - Allows users to use `@v1` for auto-updates
    - Implemented in "Update major version tag" step

### Deployment Notes
- Package-lock.json is committed for CI consistency
- Code is formatted with Prettier (run `npm run format` before committing)
- All code follows ESLint rules defined in `.eslintrc.json`
- Distribution bundle (`dist/index.js`) must be rebuilt with `npm run build` after changes

### Usage
Users can use this action in their workflows with three methods:

```yaml
# Recommended: Use major version tag (auto-updates to latest v1.x.x)
- uses: tako-dayo8/auto-release-notes@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    template: detailed

# Pin to specific version (for stability)
- uses: tako-dayo8/auto-release-notes@v1.0.0

# Use main branch (not recommended for production)
- uses: tako-dayo8/auto-release-notes@main
```

**Major Version Tag (`@v1`)**:
- The `v1` tag automatically points to the latest v1.x.x release
- Updated automatically by the release workflow (`.github/workflows/release.yml`)
- When releasing v1.1.0, the workflow extracts major version and updates `v1` tag
- Follows GitHub Actions best practices for version management

### Community Health Files
The repository includes comprehensive community documentation in `.github/`:

**Issue Templates** (`.github/ISSUE_TEMPLATE/`):
- `bug_report.yml` - Structured form for bug reports with required fields
  - Bug description, reproduction steps, expected/actual behavior
  - Action configuration, version, log output
- `feature_request.yml` - Feature request template
  - Problem statement, proposed solution, alternatives
  - Usage examples, contribution willingness
- `documentation.yml` - Documentation improvement template
  - Documentation type (README, examples, etc.)
  - Current issues and suggested improvements
- `question.yml` - Question template for user support
  - Question with context, what user has tried
  - Current configuration
- `config.yml` - Template configuration
  - Disables blank issues
  - Links to Discussions, README, Examples

**Pull Request Template**:
- `PULL_REQUEST_TEMPLATE.md` - Comprehensive PR checklist
  - Description, related issues, type of change
  - Testing checklist (unit tests, coverage, all tests pass)
  - Documentation updates (README, README_JP, comments, examples)
  - Code quality checklist (lint, format, build, review)

**Governance Documents**:
- `CODE_OF_CONDUCT.md` - Contributor Covenant 2.0
  - Community standards and expected behavior
  - Enforcement guidelines and reporting process
- `SECURITY.md` - Security policy and vulnerability reporting
  - Supported versions (v1.x.x currently supported)
  - Vulnerability reporting via GitHub Security Advisories
  - Security best practices (token security, version pinning, input validation)
  - Response timeline and disclosure policy
- `FUNDING.yml` - Sponsorship configuration (placeholder for future)

**Documentation Updates**:
- `CONTRIBUTING.md` updated with:
  - Issue template usage guide
  - Code of Conduct reference
- `README.md` and `README_JP.md` updated with:
  - Contributing section with links to all issue templates
  - Security section with vulnerability reporting guidelines
  - Community section (Discussions, Issues, Code of Conduct)

These templates ensure contributors provide necessary information and maintainers can efficiently triage issues and review PRs.

## Development Phases (Completed)

✅ **Phase 1**: Project Setup (package.json, TypeScript config, basic structure)
✅ **Phase 2**: Core Features (collector, parser, categorizer, basic templates)
✅ **Phase 3**: Extended Features (writer, releases, multiple templates)
✅ **Phase 4**: Advanced Features (retry logic, logger, validator)
✅ **Phase 5**: Testing and Documentation (unit tests, docs, CI/CD, release)
✅ **Phase 6**: Community and Automation (issue templates, major version tags, enhanced workflows)

## Known Considerations

### Optional Future Enhancements
- Integration tests (currently not implemented)
- E2E tests (currently not implemented)
- Additional template customization options
- Support for custom commit message formats beyond Conventional Commits

### Troubleshooting Tips
- If tests fail, check timezone handling in date tests (`utils.test.ts`)
- If CI fails, ensure `package-lock.json` is committed and code is Prettier-formatted
- If API rate limits occur, the retry logic will handle it automatically with exponential backoff
- Breaking change detection works with both `!` suffix and `BREAKING CHANGE:` footer

## Release Process

### Creating a New Release

1. **Ensure all changes are committed and pushed to main**
   ```bash
   git status  # Should be clean
   git push origin main
   ```

2. **Create and push a version tag** (triggers release workflow automatically)
   ```bash
   git tag -a v1.1.0 -m "Release v1.1.0"
   git push origin v1.1.0
   ```

3. **Release workflow automatically**:
   - Runs tests and builds the project
   - Generates release notes using the action itself (dogfooding)
   - Creates GitHub Release
   - **Updates major version tag** (e.g., v1) to point to new version
   - Users using `@v1` automatically get the latest v1.x.x release

4. **Verify the release**:
   ```bash
   gh release view v1.1.0
   git tag -l  # Should show both v1.1.0 and v1
   ```

### Manual Major Version Tag Update (if needed)

If you need to manually update the major version tag:
```bash
git tag -fa v1 -m "Update to v1.1.0"
git push origin v1 --force
```

However, this is now automated by the release workflow and should not be necessary.

## Working with Issues and PRs

### For Contributors

When creating issues, use the appropriate template:
- Bug reports: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Feature requests: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Documentation: `.github/ISSUE_TEMPLATE/documentation.yml`
- Questions: `.github/ISSUE_TEMPLATE/question.yml`

GitHub will automatically present these templates when creating a new issue.

### For Maintainers

When reviewing PRs:
1. Check that PR template checklist is completed
2. Verify tests pass (all CI checks green)
3. Ensure code coverage is maintained (99%+)
4. Verify documentation is updated if needed
5. Check that code follows linting and formatting standards
6. Review commit messages follow Conventional Commits

## Important Notes for Future Development

### Before Making Changes
1. Create a new branch from `main`
2. Make changes following coding standards
3. Run `npm run format` before committing
4. Run `npm test` to ensure all tests pass
5. Run `npm run build` to verify build succeeds
6. Run `npm run lint` to check for linting errors

### When Adding New Features
1. Update TypeScript types in `types.ts` if needed
2. Add unit tests in `tests/unit/`
3. Update relevant documentation (README.md, README_JP.md)
4. Add examples to `examples/` if applicable
5. Update CLAUDE.md with architectural changes
6. Follow Conventional Commits for commit messages

### When Fixing Bugs
1. Add regression test first
2. Fix the bug
3. Verify test passes
4. Update documentation if behavior changed
