# 0005: CSP with build-time script hashes

Status: accepted

## Context

SPA mode writes a few inline scripts into `index.html` (router bootstrap and the theme script that avoids a light flash). Allowing `'unsafe-inline'` for scripts would make the CSP close to useless.

## Decision

After `react-router build`, `scripts/security-headers.mjs` hashes each inline script in `index.html` and writes the policy and other security headers to `build/client/_headers`. `pnpm preview` serves the build with the same headers.

## Consequences

- Headers always match the build they ship with; nothing to update by hand.
- Adding an inline script elsewhere, or a third-party script, will be blocked. Load code from the bundle instead.
- `style-src` still allows `'unsafe-inline'`, because Radix and recharts set inline styles.
- Hosts other than Netlify and Cloudflare Pages need the headers copied into their own config.
