# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please report it by creating a private security advisory:

1. Go to the [Security tab](https://github.com/tako-dayo8/auto-release-notes/security/advisories)
2. Click "New draft security advisory"
3. Fill in the details of the vulnerability
4. Submit the advisory

Alternatively, you can report vulnerabilities by:
- Opening a private discussion in the repository
- Creating an issue with the `security` label (for non-critical issues)

### What to Include

Please include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: We aim to acknowledge receipt within 48 hours
- **Status Update**: We will provide status updates every 7 days
- **Resolution**: We aim to release a fix within 90 days of the initial report

## Security Best Practices

When using this action:

### 1. Token Security
- **Never** commit `GITHUB_TOKEN` or other secrets to your repository
- Always use GitHub Secrets for sensitive data
- Use the minimum required permissions for tokens

```yaml
permissions:
  contents: write
  pull-requests: read
  issues: read
```

### 2. Version Pinning
For production use, consider pinning to a specific version:

```yaml
# Good: Pin to specific version
- uses: tako-dayo8/auto-release-notes@v1.0.0

# Better for auto-updates: Use major version
- uses: tako-dayo8/auto-release-notes@v1

# Avoid in production: Using main branch
- uses: tako-dayo8/auto-release-notes@main
```

### 3. Input Validation
- Be cautious with user-provided inputs in templates
- Review generated release notes before publishing
- Use `dry-run: true` to preview changes

### 4. Audit Logs
- Regularly review GitHub Actions audit logs
- Monitor for unexpected workflow runs
- Check release notes for unauthorized changes

## Known Security Considerations

### GitHub API Token
This action requires a GitHub token with write access to create releases and update files. The token should have minimal required permissions:

- `contents: write` - For creating releases and updating files
- `pull-requests: read` - For reading PR information
- `issues: read` - For reading issue references

### Dependencies
We regularly update dependencies to address security vulnerabilities. To check for outdated dependencies:

```bash
npm audit
npm audit fix
```

### Code Execution
This action executes in the GitHub Actions environment and has access to:
- Repository contents
- Secrets (through workflow configuration)
- GitHub API (through the provided token)

**Important**: Only use this action from trusted sources and review the code before using it.

## Security Updates

Security updates are released as patch versions (e.g., 1.0.1, 1.0.2) and are automatically included when using major version tags (e.g., `@v1`).

To stay informed about security updates:
- Watch this repository for security advisories
- Enable Dependabot alerts
- Subscribe to release notifications

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release new versions as soon as possible
5. Publish a security advisory on GitHub

## Contact

For questions about this security policy, please open a discussion or issue in this repository.

## Attribution

This security policy is based on best practices from:
- [GitHub's Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
