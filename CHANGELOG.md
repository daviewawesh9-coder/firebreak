# Changelog

All notable changes to Firebreak are documented here.

## [0.1.0] - Unreleased

### Added

- Offline-first static application for mapping account recovery and SSO relationships.
- Manual account entry, editing, removal, and local JSON import/export.
- Dependency graph with directional recovery and SSO paths.
- Ranked recommendations with confidence labels.
- Breach-mode recovery checklist.
- Fictional demo persona.
- Regression tests for import normalization, provider aliases, directional relationships, and SMS-only recommendations.
- Documentation for privacy, security reporting, contribution, and licensing.

### Security

- Imported account IDs are regenerated before rendering.
- Imported service names and other user-controlled values are escaped before insertion into HTML.

This release is an early prototype and has not received an independent security audit.
