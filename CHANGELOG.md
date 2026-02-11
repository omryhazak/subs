# Changelog

All notable changes to Subs will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-02-10

### Added

- Live streaming panels for every Claude Code sub-agent
- Auto-detection of new `.output` files via `fs.watch`
- Incremental JSONL parsing (byte-offset tracking, no full re-reads)
- Tool call visualization with collapsible results
- Token stats bar (input/output tokens, cache hits, elapsed time, model)
- Parent session title lookup
- Completion detection with `[Done]` banner and final result highlight
- Auto-scroll with freeze-on-scroll-up
- Nonce-based Content Security Policy (no `unsafe-inline`)
- Path validation and symlink attack mitigation
- Up to 20 concurrent panels

[Unreleased]: https://github.com/omryhazak/subs/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/omryhazak/subs/releases/tag/v0.1.0
