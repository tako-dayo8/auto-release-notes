# Contributing to Auto Release Notes Generator

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Reporting Issues](#reporting-issues)

## Development Setup

### Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 9.x or higher
- **Git**: Latest version

### Installation

1. Fork and clone the repository:

```bash
git clone https://github.com/your-username/auto-release-notes.git
cd auto-release-notes
```

2. Install dependencies:

```bash
npm install
```

3. Verify the setup:

```bash
npm run build  # Should compile without errors
npm test       # Should run all tests successfully
```

## Project Structure

```
src/
├── main.ts           # Entry point
├── collector.ts      # GitHub API data collection
├── parser.ts         # Conventional Commits parsing
├── categorizer.ts    # Change categorization
├── filter.ts         # Filtering logic (chore, merge commits)
├── contributors.ts   # Contributors extraction and formatting
├── writer.ts         # File writing (CHANGELOG.md, version files)
├── releases.ts       # GitHub Releases API integration
├── formatter.ts      # Text formatting utilities
├── utils.ts          # General utility functions
├── retry.ts          # Retry logic with exponential backoff
├── logger.ts         # Enhanced logging utilities
├── validator.ts      # Input validation
├── types.ts          # TypeScript type definitions
└── templates/        # Release notes templates
    ├── base.ts
    ├── standard.ts
    ├── detailed.ts
    ├── minimal.ts
    └── index.ts

tests/
├── unit/             # Unit tests
├── integration/      # Integration tests
└── e2e/              # End-to-end tests
```

## Coding Standards

### TypeScript

- Use **TypeScript 5.x** features
- Enable strict mode
- Provide type annotations for function parameters and return values
- Avoid `any` type; use `unknown` if necessary

### Code Style

We use ESLint and Prettier for code formatting:

```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Auto-fix linting errors
npm run format      # Format code with Prettier
```

**Key conventions:**

- Use `const` and `let`, never `var`
- Use arrow functions for callbacks
- Use descriptive variable names
- Add JSDoc comments for public APIs

Example:

```typescript
/**
 * Parse a commit message using Conventional Commits format
 * @param commit - The commit to parse
 * @returns Parsed commit with extracted metadata
 */
export function parseCommit(commit: ParsedCommit): ParsedCommit {
  // Implementation
}
```

### File Organization

- One primary export per file
- Group related functions in the same file
- Keep files under 300 lines when possible
- Use index files for clean exports

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run with coverage report
```

### Writing Tests

**Test file naming:** `filename.test.ts`

**Test structure:**

```typescript
describe('functionName', () => {
  test('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = functionName(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

**Coverage requirements:**

- Minimum 80% coverage for all metrics (statements, branches, functions, lines)
- Write tests for edge cases
- Mock external dependencies (@actions/core, @actions/github)

### Test Types

1. **Unit Tests** (`tests/unit/`):
   - Test individual functions in isolation
   - Mock all external dependencies
   - Fast execution

2. **Integration Tests** (`tests/integration/`):
   - Test interactions between modules
   - Use mocked GitHub API responses
   - Test file I/O operations

3. **E2E Tests** (`tests/e2e/`):
   - Test complete workflows
   - Simulate real scenarios
   - Verify end-to-end functionality

## Pull Request Process

### Before Submitting

1. **Create an issue** (for new features or significant changes)
2. **Fork the repository** and create a new branch
3. **Make your changes** following the coding standards
4. **Add tests** for new functionality
5. **Run all checks**:

```bash
npm run lint        # No linting errors
npm run format      # Code properly formatted
npm test            # All tests passing
npm run build       # Builds successfully
```

### Branch Naming

Use descriptive branch names:

- `feat/add-custom-templates` - New features
- `fix/api-rate-limiting` - Bug fixes
- `docs/update-readme` - Documentation updates
- `refactor/improve-parser` - Code refactoring
- `test/add-validator-tests` - Test additions

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing
- [ ] Coverage maintained/improved

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. Automated checks must pass (tests, linting, build)
2. At least one maintainer approval required
3. Address review feedback promptly
4. Squash commits before merging (if requested)

## Commit Message Guidelines

We follow **Conventional Commits** specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes (dependencies, etc.)

### Examples

```
feat(parser): add support for custom commit types

Allows users to define custom commit types beyond
the standard Conventional Commits specification.

Closes #123
```

```
fix(filter): correctly handle PR labels with spaces

Previously, labels containing spaces were not properly
matched against the exclude list.
```

```
feat!: remove deprecated API endpoints

BREAKING CHANGE: The /api/v1 endpoints have been removed.
Users must migrate to /api/v2.
```

### Breaking Changes

For breaking changes, either:
- Add `!` after the type: `feat!: breaking change`
- Add `BREAKING CHANGE:` in the footer

## Reporting Issues

We provide several issue templates to help you report problems or suggest improvements effectively.

### Using Issue Templates

When you create a new issue, you'll be prompted to choose from the following templates:

#### 1. **Bug Report** 🐛
Use this template when reporting bugs or unexpected behavior.

The template will guide you through providing:
- Bug description and steps to reproduce
- Expected vs. actual behavior
- Action configuration and version
- Relevant log output

#### 2. **Feature Request** ✨
Use this template to suggest new features or enhancements.

The template will help you describe:
- The problem you're trying to solve
- Your proposed solution
- Alternative approaches you've considered
- Usage examples

#### 3. **Documentation Improvement** 📚
Use this template to suggest documentation improvements.

You'll be asked to specify:
- Which documentation needs improvement (README, examples, etc.)
- What's wrong or missing
- Suggested improvements

#### 4. **Question** ❓
Use this template to ask questions about using the action.

The template helps you provide:
- Your question and context
- What you've already tried
- Your current configuration

### Additional Resources

Before creating an issue:
- Check [existing issues](https://github.com/tako-dayo8/auto-release-notes/issues) to avoid duplicates
- Review the [README](https://github.com/tako-dayo8/auto-release-notes#readme) and [examples](https://github.com/tako-dayo8/auto-release-notes/tree/main/examples)
- Visit [GitHub Discussions](https://github.com/tako-dayo8/auto-release-notes/discussions) for community support

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](.github/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

Key principles:
- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help maintain a welcoming community

Please report any unacceptable behavior by opening an issue or contacting the project maintainers.

## Questions?

If you have questions:

1. Check existing issues and discussions
2. Review the documentation
3. Open a new issue with the "question" label

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Auto Release Notes Generator! 🎉
