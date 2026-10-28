# Marketing launch checklist

Everything here runs once hosting is decided and a staging host exists.

## Before staging

- [ ] Translation batch done. `pnpm --filter marketing build` lists the pages per locale
      in the sitemap; nothing ships in a locale until its namespaces are complete.
- [ ] Production env set: `VITE_ENV=production`, `VITE_SITE_URL=https://letshyre.ai`,
      `VITE_APP_URL=https://letshyre.ai`, `VITE_META_PIXEL_ID`, `VITE_COOKIE_DOMAIN=.letshyre.ai`.
- [ ] `pnpm verify` green, plus `pnpm --filter marketing lighthouse`.

## Staging UAT

Every page in `en`, `ar` and one Indic locale (`hi`), on Chrome, Safari iOS, Firefox and
Android Chrome:

- [ ] Content, layout and RTL look right; no English left on translated pages.
- [ ] Keyboard only: skip link, menus, FAQ, forms. NVDA (Windows) and VoiceOver (iOS) pass.
- [ ] Contact form and footer newsletter submit and confirm.
- [ ] Pricing → `/employer/billing?checkout=<key>`, signed in and signed out (sign-in returns to
      the open checkout). A Razorpay test-mode purchase completes and shows on Invoices.
- [ ] Dashboard and Invoices "Buy credits" open billing.
- [ ] App dashboards reachable from the handoff links: sign-in, interview (camera and mic prompt), scorecards.
- [ ] Meta Pixel fires only after consent.
- [ ] Browser console: no `Content-Security-Policy-Report-Only` violations.

## Production

- [ ] Deploy in a low-traffic window; the host must apply each build's `csp.map` policies.
- [ ] Spot-check the URL contract (`docs/baseline/url-contract.md`) on the live site.
- [ ] Resubmit `https://letshyre.ai/sitemap.xml` in Search Console.

## First 7 days

- 404 and 302 rates, Search Console coverage and hreflang errors, CWV field data, sign-up
  conversion.
- After a clean week of report-only CSP: build with `CSP_ENFORCE=true` and drop the
  report-only header on the host.
- Roll back if indexed pages drop more than 10% or errors spike: redeploy the previous build.
