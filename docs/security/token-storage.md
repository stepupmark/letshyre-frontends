# Token storage — current state, risk, and recommendation

_Status: **writeup only**. Nothing in this document has been implemented; it
records the current design, why it is a risk, and what a fix would take so the
decision can be made deliberately (a real migration needs backend changes —
see [What a fix requires](#what-a-fix-requires))._

## How auth tokens are stored today

The app authenticates against a Django + Simple JWT backend and keeps the
resulting tokens in **`localStorage`**:

| Key            | Written by                          | Read by                                   |
| -------------- | ----------------------------------- | ----------------------------------------- |
| `accessToken`  | `login()`, refresh interceptor      | request interceptor (`Authorization` hdr) |
| `refreshToken` | `login()`, refresh interceptor      | refresh interceptor                       |
| `user`         | `login()` (the whole login payload) | route guards, feature components          |

Key locations:

- [`app/services/auth.service.js`](../../app/services/auth.service.js) —
  `login()` writes all three keys; `logoutMe()` calls `localStorage.clear()`.
- [`app/services/api.js`](../../app/services/api.js) — the request interceptor
  attaches `Bearer <accessToken>`; the response interceptor performs the 401 →
  `login_refresh` → retry dance and persists rotated tokens.
- Note `getRefreshToken()` in `api.js` has a **fallback that reads the refresh
  token out of the `user` object** (`user.refresh_token || user.refresh`). So
  the refresh token can live in **two** places, which widens the surface below.

## The risk

`localStorage` is readable by **any JavaScript running on the origin**. That
means a single successful XSS — from our own code, a compromised npm
dependency, or an injected third-party script — can read `accessToken` **and**
`refreshToken` and exfiltrate them. With the refresh token, an attacker holds a
**long-lived** credential they can use off-site to mint new access tokens; a
password change does not necessarily revoke it. `httpOnly` cookies, by
contrast, are **not** reachable from JavaScript, so the same XSS cannot read
them.

Contributing factors specific to this codebase:

1. **The refresh token — the high-value, long-lived credential — is in
   `localStorage`, not just the short-lived access token.** This is the part
   most worth getting out of JS reach.
2. **It is duplicated into the `user` object** via the `getRefreshToken()`
   fallback, so clearing one copy is not enough.
3. **Token rotation is on** (`ROTATE_REFRESH_TOKENS=True`, per the comment in
   `api.js`), which is good, but rotation only limits reuse — it does not stop
   a stolen token from being used once.

This is the standard, well-understood trade-off of SPA token storage, not a
novel bug. It is filed as a hardening item, not an active incident.

## Recommendation

**Target:** the backend sets the **refresh token** as an `httpOnly`, `Secure`,
`SameSite=Strict` (or `Lax`) cookie scoped to the refresh endpoint; the browser
never sees it in JS. The **access token** stays short-lived and may remain in
memory (a module variable) rather than `localStorage`, so a page reload
triggers a silent refresh via the cookie.

Defense-in-depth that is cheaper than the full migration and worth doing
regardless:

- Keep **access-token lifetime short** so a leaked access token expires fast.
- Ensure **logout revokes/blacklists the refresh token server-side**, not only
  clears client storage.
- Add a **Content-Security-Policy** to shrink the XSS surface that makes token
  theft possible in the first place.
- Remove the `getRefreshToken()` **`user`-object fallback** so the refresh
  token lives in exactly one place.

## What a fix requires

This cannot be completed frontend-only. Moving the refresh token to an
`httpOnly` cookie needs the **backend** to:

1. Return the refresh token as a `Set-Cookie` (`httpOnly; Secure; SameSite`)
   on login and on refresh, instead of (or in addition to) the JSON body.
2. Read the refresh token from that cookie on `/user/v1/login_refresh/`.
3. Set **CORS** `Access-Control-Allow-Credentials: true` and a specific
   (non-`*`) allowed origin, since credentialed requests forbid the wildcard.

Frontend changes that follow:

- `axios.create({ withCredentials: true })` so the cookie is sent.
- Drop `refreshToken` from `localStorage` and from the `user` payload; stop
  reading/writing it in `auth.service.js` and `api.js`.
- Hold the access token in a module-scope variable; on cold load, call refresh
  first and gate the app on it (a hydration/loader step).

Until the backend supports the cookie flow, the storage model stays as-is by
necessity — this document is the record of that decision.
