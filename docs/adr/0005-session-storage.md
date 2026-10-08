# 0005 · Tokens stay in `localStorage` under the legacy keys

Accepted 2026-10-04.

## Context

The Django API issues an access and a refresh token in the response body. Legacy kept both, and the
user, in `localStorage` (`accessToken`, `refreshToken`, `user`). Any script on the origin can read
them ([token-storage.md](../security/token-storage.md)).

## Decision

`@workspace/auth` keeps the same keys, so people signed in on legacy stay signed in on the new app.
Refresh is single-flight, and a failed refresh ends the session cleanly.

## Consequences

- An XSS, or a compromised third-party script on the origin, can take the refresh token. CSP
  ([0012](./0012-csp-hashes.md)) and consent-gated analytics reduce the risk but don't remove it.
- The fix is on the backend: the refresh token in an httpOnly, `Secure` cookie on `.letshyre.ai`,
  the access token in memory. It is also what makes the subdomain move painless.
