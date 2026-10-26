# Token storage

Where the session lives today, why that is a risk, and what moving it out of JavaScript's reach
would take. ADR 0005 records the decision to keep the current model for now.

## Today

Every app signs in through `@workspace/auth`, against the Django + Simple JWT backend. The tokens
stay in `localStorage` under the keys the legacy app used, so nobody was signed out by the switch:

| Key            | Holds                                   | Written by                |
| -------------- | --------------------------------------- | ------------------------- |
| `accessToken`  | short-lived access token                | `login()`, the refresher  |
| `refreshToken` | rotating refresh token                  | `login()`, the refresher  |
| `user`         | the login payload, with tokens stripped | `login()`, `updateUser()` |

- [session.ts](../../packages/auth/src/session.ts) reads and writes the keys. `saveUser()` strips
  every token field, so the refresh token lives in one place only.
- [client.ts](../../packages/auth/src/client.ts) adds `Authorization: Bearer <access>` to each
  request and runs a 401 through the refresher once.
- [refresh.ts](../../packages/auth/src/refresh.ts) posts to `user/v1/login_refresh/`, saves the
  rotated pair, and holds a Web Lock so two tabs never spend the same refresh token. Only a rejected
  refresh token ends the session; network errors and 5xx keep it.
- `logout()` revokes the refresh token on the server, then clears the keys either way.

## The risk

`localStorage` is readable by any script on the origin. One XSS, whether from our code, a
compromised dependency or an injected third-party script, can read both tokens. The refresh token
is the valuable one: it is long-lived and mints new access tokens off-site until it is revoked.

What limits the damage today:

- A hash-based CSP (ADR 0012) with no `unsafe-inline` scripts and no `unsafe-eval`.
- No `dangerouslySetInnerHTML` outside the admin theme script and shadcn's chart styles; links from
  the API go through `safeUrl`.
- Refresh tokens rotate, and logout revokes them on the server.

## Target

The backend sets the refresh token as an `httpOnly; Secure; SameSite=Lax` cookie scoped to the
refresh endpoint, and the access token stays in memory only. On a cold load the app calls refresh
first and waits for it before rendering a protected page.

### Backend changes

1. Send the refresh token in `Set-Cookie` on login and refresh, not in the JSON body.
2. Read it from the cookie on `user/v1/login_refresh/` and `user/v1/logout/`.
3. Allow credentials in CORS for the exact app origins (no `*`).

### Frontend changes

- Send `credentials: "include"` on the refresh and logout calls in `packages/auth`.
- Keep the access token in a module variable instead of `localStorage`; drop the `refreshToken` key.
- Add a startup step in each app's root that refreshes before the first protected route renders,
  and keep the cross-tab sign-out signal on the `user` key.

Until the backend supports the cookie, the storage model stays as it is.
