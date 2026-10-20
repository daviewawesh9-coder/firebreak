# Security policy

## Scope

Firebreak is a client-side prototype. It does not authenticate users, contact account providers, or upload account maps. Security reports about the app, its import/export behavior, or its documentation are welcome.

## Reporting a vulnerability

Please do not post exploitable details or private data in a public issue. If private GitHub vulnerability reporting is enabled for the repository, use that channel. Otherwise, contact the repository owner through their verified GitHub profile before public disclosure.

Include:

- A clear description and impact.
- A minimal reproduction using fictional data.
- Browser and operating-system details.
- The affected file or behavior.
- A suggested mitigation, if known.

Allow reasonable time for investigation and a fix before public disclosure. Do not test against other people's accounts or services.

## Security boundaries

- Treat imported JSON as untrusted input.
- Do not enter passwords, recovery codes, access tokens, or real secrets.
- Firebreak's recommendations are not a guarantee that an account is safe.
- The project has not had a full independent security audit.
