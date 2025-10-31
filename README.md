# Auto Release Notes Generator

A TypeScript-based GitHub Action that automatically generates release notes from PRs, commits, and issues when you push a new tag. Supports Conventional Commits, multiple output templates, and seamless GitHub Releases integration.

[![Test](https://github.com/tako-dayo8/auto-release-notes/workflows/Test/badge.svg)](https://github.com/tako-dayo8/auto-release-notes/actions)
[![Coverage](https://img.shields.io/badge/coverage-99%25-brightgreen)](https://github.com/tako-dayo8/auto-release-notes)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

English | [日本語](./README_JP.md)

## Features

- **Automatic Release Notes Generation**: Generates structured release notes from git history
- **Conventional Commits Support**: Parses commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification
- **GitHub Labels Fallback**: Categorizes PRs by labels when commit format is not conventional
- **Multiple Templates**: Choose from Standard, Detailed, or Minimal output formats
- **Smart Filtering**: Excludes chore commits and PRs with specific labels
- **Breaking Changes Detection**: Automatically identifies and highlights breaking changes
- **Contributors List**: Generates a sorted list of contributors (excluding bots)
- **GitHub Releases Integration**: Optionally creates GitHub Releases with your release notes
- **Dry Run Mode**: Preview release notes without making any changes
- **Retry Logic**: Built-in retry mechanism for GitHub API calls with exponential backoff

## Installation

### From GitHub Marketplace

_(Coming soon)_

### Direct Reference

Add this action to your workflow by referencing this repository:

```yaml
- uses: tako-dayo8/auto-release-notes@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Usage

### Basic Example

Create a workflow file (e.g., `.github/workflows/release.yml`):

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: read
      issues: read

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Required to fetch all git history

      - name: Generate Release Notes
        uses: tako-dayo8/auto-release-notes@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          template: standard
          create-github-release: true
```

### Advanced Example

```yaml
- name: Generate Release Notes
  uses: tako-dayo8/auto-release-notes@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    template: detailed
    changelog-file: docs/CHANGELOG.md
    version-file: true
    create-github-release: true
    exclude-labels: skip-changelog,internal,wip
    dry-run: false
```

## Inputs

| Input                   | Description                                               | Required | Default                       |
| ----------------------- | --------------------------------------------------------- | -------- | ----------------------------- |
| `github-token`          | GitHub token for API access                               | Yes      | `${{ github.token }}`         |
| `template`              | Template preset: `standard`, `detailed`, `minimal`        | No       | `standard`                    |
| `changelog-file`        | Path to CHANGELOG.md file                                 | No       | `CHANGELOG.md`                |
| `version-file`          | Enable individual version files in `changelog/` directory | No       | `true`                        |
| `create-github-release` | Create GitHub Release                                     | No       | `true`                        |
| `exclude-labels`        | Comma-separated list of labels to exclude from changelog  | No       | `skip-changelog,no-changelog` |
| `dry-run`               | Run without making any changes (preview mode)             | No       | `false`                       |

## Outputs

| Output          | Description                                       |
| --------------- | ------------------------------------------------- |
| `release-notes` | Generated release notes content (markdown)        |
| `version`       | Detected version from the pushed tag              |
| `changelog-url` | URL to the created GitHub Release (if applicable) |

## Templates

### Standard (Default)

Clean, well-organized format with emoji icons and category sections:

```markdown
## [1.0.0] - 2025-01-31

### ✨ Features

- Add user authentication (#123) @alice
- Implement dark mode (#125) @bob

### 🐛 Bug Fixes

- Fix login redirect issue (#124) @charlie

### Contributors

@alice, @bob, @charlie

**Full Changelog**: https://github.com/owner/repo/compare/v0.9.0...v1.0.0
```

### Detailed

Includes commit hashes, issue numbers, and contributor statistics:

```markdown
## [1.0.0] - 2025-01-31

### 📊 Statistics

- 15 pull requests
- 45 commits
- 8 issues closed
- 3 contributors

### ✨ Features

- Add user authentication (#123) @alice
  - Commit: d4e5f6g
  - Closes: #100, #105

### 👥 Contributors

This release was made possible by:

- @alice (8 PRs)
- @bob (5 PRs)
- @charlie (2 PRs)
```

### Minimal

Simplified format without categories:

```markdown
## 1.0.0

- Add user authentication (#123)
- Implement dark mode (#125)
- Fix login redirect issue (#124)
```

## Categorization

Changes are automatically categorized based on:

1. **Conventional Commits** (primary):
   - `feat:` → ✨ Features
   - `fix:` → 🐛 Bug Fixes
   - `docs:` → 📚 Documentation
   - `perf:` → ⚡ Performance
   - `refactor:` → 🔧 Refactoring
   - `style:` → 🎨 Style
   - `test:` → ✅ Tests
   - `build:` → 🔨 Build System
   - `ci:` → 🤖 CI/CD
   - `chore:` → Excluded by default

2. **GitHub Labels** (fallback):
   - `feature`, `enhancement` → Features
   - `bug`, `bugfix` → Bug Fixes
   - `documentation` → Documentation
   - `performance` → Performance
   - `breaking-change` → Breaking Changes

## Breaking Changes

Breaking changes are detected via:

1. Conventional Commits footer:

   ```
   feat: update authentication

   BREAKING CHANGE: remove basic auth support
   ```

2. Type with `!` suffix:

   ```
   feat!: breaking feature
   ```

3. GitHub label:
   - `breaking-change` label on PRs

## Filtering

The following are automatically excluded from release notes:

- **Chore commits**: Commits with `chore:` prefix
- **Labeled PRs**: PRs with `skip-changelog` or `no-changelog` labels (configurable)
- **Bot accounts**: Contributions from dependabot, renovate, github-actions, etc.

## Required Permissions

Your workflow must have the following permissions:

```yaml
permissions:
  contents: write # Required to create releases and update files
  pull-requests: read # Required to fetch PR information
  issues: read # Required to fetch linked issues
```

## Dry Run Mode

Preview generated release notes without making any changes:

```yaml
- name: Preview Release Notes
  uses: tako-dayo8/auto-release-notes@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    dry-run: true
```

Output:

```
[DRY RUN] Generated release notes:
----------------------------------------
## [1.0.0] - 2025-01-31
...
----------------------------------------
[DRY RUN] Would write to: CHANGELOG.md
[DRY RUN] Would create GitHub Release: v1.0.0
```

## Examples

### Prerelease Support

```yaml
on:
  push:
    tags:
      - 'v*.*.*'
      - 'v*.*.*-beta.*'
      - 'v*.*.*-rc.*'
```

Prerelease versions (containing `-alpha`, `-beta`, `-rc`, `-pre`) are automatically marked as prereleases in GitHub Releases.

### Custom Changelog Location

```yaml
with:
  changelog-file: docs/releases/CHANGELOG.md
```

### Disable Version Files

```yaml
with:
  version-file: false # Won't create individual files in changelog/
```

## Troubleshooting

### No release notes generated

- Ensure your tag follows Semantic Versioning: `v1.0.0`, `v2.3.5`, etc.
- Check that `fetch-depth: 0` is set in your checkout step
- Verify the GitHub token has required permissions

### "Invalid tag format" error

Tags must:

- Start with `v` (e.g., `v1.0.0`)
- Follow Semantic Versioning (Major.Minor.Patch)
- Example valid tags: `v1.0.0`, `v2.3.5-beta.1`
- Example invalid tags: `1.0.0`, `release-1.0.0`

### API rate limiting

The action includes retry logic with exponential backoff. For very large repositories (1000+ PRs), consider:

- Running less frequently
- Using a personal access token with higher rate limits

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Building

```bash
npm run build  # Compile TypeScript and bundle with ncc
```

## License

[MIT](LICENSE)

## Credits

Built with:

- [@actions/core](https://github.com/actions/toolkit/tree/main/packages/core)
- [@actions/github](https://github.com/actions/toolkit/tree/main/packages/github)
- [conventional-commits-parser](https://github.com/conventional-changelog/conventional-changelog)

---

**Note**: This action is designed to work with repositories that follow Conventional Commits or use GitHub labels for categorization. For best results, maintain consistent commit message formatting throughout your project.
