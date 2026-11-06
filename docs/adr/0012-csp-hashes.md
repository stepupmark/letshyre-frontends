# 0012 · Hash-based CSP, report-only until a clean week

Accepted 2026-10-03.

## Context

Both apps are static builds with inline bootstrap scripts, and the app loads Razorpay. A
nonce-based CSP needs a server per request; we serve static files only.

## Decision

Each build computes the script hashes of its HTML (`tooling/csp.ts`) and writes a `csp.map` (path to policy)
that the host turns into headers. Policies ship as `Content-Security-Policy-Report-Only`; after a clean week a build
with `CSP_ENFORCE=true` moves the policy into a meta tag. The app's e2e server enforces it already,
so a policy that breaks the app fails the tests.

## Consequences

- Hosting is not set up yet; whichever host is chosen must apply `csp.map` on every release.
- Adding a third-party script means adding its origin to the build's policy, on purpose.
- `style-src` keeps `'unsafe-inline'`: React and motion write `style` attributes, which hashes
  can't cover. Don't widen any other directive to match.
- `frame-ancestors` and the other security headers come from the host (url-contract §5), since a
  meta-tag policy can't set them.
- Nothing collects violation reports yet; `report-to` waits on an error-reporting endpoint.
