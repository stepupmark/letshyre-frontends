# 0004: Tokens in localStorage for now

Status: accepted, to be superseded

## Context

The ideal is a refresh token in an `HttpOnly; Secure; SameSite=Strict` cookie and an access token held only in memory. That needs the backend to set cookies and check a CSRF header, which it doesn't yet.

## Decision

Keep both tokens in `localStorage` for now, but reduce the risk around it:

- Only `lib/auth/token-store.ts` reads or writes tokens, so the later move to cookies is one module.
- A strict CSP (see 0005) makes injected scripts much harder.
- Refresh is single-flight across tabs (Web Locks), since the backend rotates refresh tokens and blacklists the old one.
- Sign-out, expiry and a 30-minute idle timeout end the session in every tab (BroadcastChannel).

## Consequences

Any script that does run in the page can still read the tokens. Moving to cookies stays on the backlog until the API supports it.
