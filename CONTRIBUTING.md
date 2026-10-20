# Contributing to Firebreak

Thanks for considering a contribution. Firebreak is intentionally small, local, and auditable.

## Before you start

- Read the README and SECURITY policy.
- Search existing issues before opening a new one.
- Never include real account identifiers, passwords, recovery codes, breach data, or screenshots containing private information.
- Keep changes focused and explain the user-facing effect.

## Local development

Requirements:

- A modern browser for the app.
- Node.js 18 or newer for the test and syntax-check commands.

```bash
npm test
npm run check
```

Open `index.html` directly or use a static-file server to exercise the UI.

## Good first contributions

- Add regression tests for graph and import edge cases.
- Improve keyboard navigation or screen-reader labels.
- Improve explanations without making security guarantees.
- Document a provider alias or service behavior with a reliable public source.

## Pull requests

Please include:

1. What changed and why.
2. How you tested it.
3. Any privacy or security implications.
4. Screenshots for meaningful UI changes, using fictional data only.

Do not modify Git history or squash other contributors' work without agreement.
