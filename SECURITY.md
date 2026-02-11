# Security Policy

## Supported Versions

| Version  | Supported          |
| -------- | ------------------ |
| latest   | :white_check_mark: |
| < latest | :x:                |

Only the most recent release receives security updates.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it through
[GitHub's Private Vulnerability Reporting](https://github.com/omryhazak/subs/security/advisories/new).

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Do not** open a public issue for security vulnerabilities.

## Response Timeline

- Acknowledgment: Within 48 hours
- Assessment: Within 5 business days
- Fix: Varies by severity, targeting 14 days for critical issues

## Scope

This policy covers the Subs VS Code extension. Issues with VS Code itself
or Claude Code should be reported to their respective maintainers.

## Security Characteristics

- **No network access:** This extension does not make any network requests
- **Local file reading only:** Reads JSONL files from `/tmp/claude-{UID}/`
- **No credentials:** Does not store or handle any credentials or secrets
- **No code execution:** Does not execute any content read from files
- **No telemetry:** Does not collect any data
