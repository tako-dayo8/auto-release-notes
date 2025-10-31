# Usage Examples

This directory contains various example workflows demonstrating different use cases of the Auto Release Notes Generator.

## Examples

### [basic-usage.yml](./basic-usage.yml)
The simplest configuration using all default settings. Perfect for getting started quickly.

**Features:**
- Standard template
- Creates CHANGELOG.md
- Creates version-specific files in changelog/
- Creates GitHub Release

### [custom-template.yml](./custom-template.yml)
Demonstrates using different template presets (standard, detailed, minimal).

**Use cases:**
- Detailed template for comprehensive release notes with statistics
- Minimal template for simple, compact changelogs

### [with-exclusions.yml](./with-exclusions.yml)
Shows how to exclude specific PRs and commits from release notes.

**Features:**
- Custom exclude labels
- Filters internal/WIP changes
- Excludes dependency updates

### [dry-run.yml](./dry-run.yml)
Preview release notes without making any changes to your repository.

**Use cases:**
- Testing the action configuration
- Reviewing generated content before publishing
- Debugging categorization issues

### [prerelease.yml](./prerelease.yml)
Handles both stable releases and prereleases (alpha, beta, rc).

**Features:**
- Supports multiple tag patterns
- Automatically detects prerelease versions
- Marks GitHub Releases appropriately

### [custom-changelog-location.yml](./custom-changelog-location.yml)
Demonstrates using custom file paths for changelog storage.

**Use cases:**
- Storing changelog in docs/ directory
- Organizing releases in a dedicated folder
- Custom repository structure

### [no-github-release.yml](./no-github-release.yml)
Only updates CHANGELOG.md without creating a GitHub Release.

**Use cases:**
- Manual release process
- Custom release workflows
- Changelog-only updates

## Quick Start

1. Choose an example that matches your use case
2. Copy the workflow file to `.github/workflows/` in your repository
3. Modify the `uses:` line to reference the correct action version
4. Customize inputs as needed
5. Push a tag to trigger the workflow:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Tips

- Always use `fetch-depth: 0` in the checkout step to fetch full git history
- Ensure your workflow has the required permissions (contents: write, pull-requests: read, issues: read)
- Test with dry-run mode first to preview the generated release notes
- Use conventional commit messages for better categorization

## Need Help?

- Check the [main README](../README.md) for detailed documentation
- Review [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines
- Open an issue if you encounter problems
