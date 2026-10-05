# 0012 · Hash-based CSP, report-only until a clean week

Accepted 2026-10-03.

## Context

Both apps are static builds with inline bootstrap scripts, and the app loads Razorpay. A
nonce-based CSP needs a server per request; we have only nginx.

## Decision

Each build computes the script hashes of its HTML (`tooling/csp.ts`) and writes a `csp.map` that
nginx includes. Policies ship as `Content-Security-Policy-Report-Only`; after a clean week a build
with `CSP_ENFORCE=true` moves the policy into a meta tag. The app's e2e server enforces it already,
so a policy that breaks the app fails the tests.

## Consequences

- nginx is reloaded after every release, since it reads `csp.map` at load.
- Adding a third-party script means adding its origin to the build's policy, on purpose.
