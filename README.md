# Firebreak

## Find the account everything depends on.

Firebreak is an offline-first account security mapping tool created by [Davie Wawesh](https://github.com/daviewawesh9-coder). It turns the recovery emails, phone numbers, sign-in providers, and 2FA methods you choose to enter into a private dependency map, then ranks the highest-impact improvements.

![Firebreak demo showing a fictional account dependency map](docs/demo.png)

> Firebreak is a decision-support prototype, not a breach detector or a guarantee of account safety.

## Why Firebreak?

Accounts are rarely independent. An email account may reset a bank account, a phone number may recover several services, and a single sign-in provider may open many apps. When something is breached, generic advice can leave people unsure what to do first.

Firebreak is designed for people who want a clearer next step:

- **Individuals** who want to understand their personal account dependencies.
- **Freelancers and small teams** who need a lightweight, local map before adopting a larger security process.
- **Privacy-minded users** who do not want to upload an account inventory to a service.
- **Contributors** who want to improve an auditable, dependency-free web tool.

## What it does

- **Manual account inventory:** Add a service, login identifier, recovery path, SSO provider, and 2FA method. Passwords are never requested.
- **Dependency map:** See explicit recovery and sign-in relationships between the accounts you entered.
- **Impact-ranked recommendations:** Find accounts with the largest mapped downstream impact and understand why they were ranked.
- **Breach mode:** Select a fictional or personal account and receive an ordered recovery checklist based on the relationships in your map.
- **Confidence labels:** Explicit recovery matches are high confidence; SSO relationships are treated as medium confidence.
- **Local JSON transfer:** Export or import a map yourself. Imported records receive fresh internal IDs.
- **Demo persona:** Load fictional data and explore the workflow without entering personal information.

## Quick start

### Fastest option

1. Download or clone this repository.
2. Open [`index.html`](index.html) in a modern browser.
3. Select **Load demo**.
4. Scroll to **Your Firebreak** and inspect the map and recommendations.
5. Add your own accounts only if you understand the privacy model below.

### Optional local server

If your browser or editor restricts local files, use any static-file server. With Node.js 18 or newer:

```bash
npx serve .
```

Then open the local URL shown by the command. Firebreak itself has no runtime dependency or backend.

### Fictional example

The built-in demo uses fictional values such as `alex@gmail.com`, `alex@example.com`, and `+1 555 0100`. They are sample data only. Do not use real passwords, recovery codes, or secrets in Firebreak.

## How to read the map

An arrow points from an account that may help unlock or recover another account. For example, a recovery path from Gmail to a bank account means the entered bank recovery identifier matches the Gmail login identifier.

The current engine recognizes provider aliases such as **Gmail ↔ Google** and **Outlook ↔ Microsoft** for SSO matching. The map only knows what you enter; it does not discover hidden recovery methods or verify a service's current policies.

The blast-radius number is a simple heuristic based on mapped connections and selected 2FA settings. It is not a validated risk score, probability, or guarantee.

## Privacy and security

- The app is a static site with no server, account system, analytics, or breach API.
- Account entries stay in JavaScript memory for the current page session.
- Reloading the page clears the in-memory map unless you explicitly export it.
- Import and export happen locally in the browser.
- No passwords, recovery codes, or access tokens are collected.
- Imported JSON is treated as untrusted input; IDs are regenerated before rendering.
- The demo contains fictional data.

For the full security reporting process, see [`SECURITY.md`](SECURITY.md). This project has not undergone a full penetration test or independent security audit.

## Current limitations

- Account relationships must be entered manually.
- The app does not log in to services or verify recovery configuration.
- Service behavior and provider aliases can change.
- Missing or incorrect input produces an incomplete map.
- The heuristic score should not be used as a formal security assessment.
- There is no automatic persistence, synchronization, team workspace, or password-reuse analysis.

## Roadmap

The roadmap is intentionally small and evidence-driven:

1. **0.1 — Public prototype:** Manual inventory, dependency map, explainable recommendations, breach mode, local import/export.
2. **0.2 — Safer guidance:** Expand automated regression coverage, improve accessibility, and document service-rule provenance.
3. **0.3 — Better sharing:** Add a privacy-preserving, redacted map export and clearer confidence explanations.
4. **Later, if validated:** Community-maintained service rules, optional local persistence, and a family/team workflow.

Automatic account imports, password analysis, breach monitoring, and cloud synchronization are not planned until their privacy and threat models are well-defined.

## Contributing

Start with [`CONTRIBUTING.md`](CONTRIBUTING.md). Good first contributions include improving explanations, adding tests for graph edge cases, and documenting a service rule with a source and confidence level.

Please do not submit real account data, credentials, breach dumps, or private recovery information in issues or pull requests.

## License

Firebreak is released under the [MIT License](LICENSE). MIT permits reuse, modification, and redistribution, including commercial use, provided the copyright and license notice are preserved. It does not prevent lawful reuse, require every fork to credit the original creator in a prominent way, or guarantee that the name and brand will be preserved.

## Try it and help

Open the demo, inspect the code, and try a fictional map. If Firebreak is useful, a genuine GitHub star, bug report, or focused contribution helps more than promotion without feedback.
