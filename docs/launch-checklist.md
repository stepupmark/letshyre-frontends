# Marketing launch checklist

Hosting is S3 and CloudFront (docs/deployment.md, ADR 0022). "Staging" below is the beta:
`beta.letshyre.ai` with `app.letshyre.ai`.

## Before the beta

- [ ] Translation batch done. `pnpm --filter marketing build` lists the pages per locale
      in the sitemap; nothing ships in a locale until its namespaces are complete.
- [ ] Beta env set: `VITE_ENV=production`, `VITE_INDEXABLE=false`,
      `VITE_SITE_URL=https://beta.letshyre.ai`, `VITE_APP_URL=https://app.letshyre.ai`,
      `VITE_META_PIXEL_ID`, `VITE_COOKIE_DOMAIN=.letshyre.ai` (docs/deployment.md §6).
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

- [ ] Move to `letshyre.ai` with the runbook in docs/deployment.md §10, in a low-traffic window:
      `VITE_SITE_URL=https://letshyre.ai` and `VITE_INDEXABLE=true`, then DNS.
- [ ] The deploy workflow's nightly run (00:30 UTC) is on, so blog posts dated in the future go
      live on their day.
- [ ] Set `INDEXNOW_KEY` for production builds and run `pnpm --filter marketing indexnow` after
      each deploy, so Bing and other IndexNow engines hear about new and updated posts
      (ADR 0021).
- [ ] Spot-check the URL contract (`docs/baseline/url-contract.md`) on the live site.
- [ ] Resubmit `https://letshyre.ai/sitemap.xml` in Search Console and Bing Webmaster Tools.
      Verify both by DNS record, so no verification tag needs a CSP hash. Bing's index also feeds
      Copilot and other AI search, so it's worth the same care as Google.
- [ ] `https://letshyre.ai/llms.txt` and `/robots.txt` answer 200 from the live host.
- [ ] Rich Results Test on `/en`, `/en/pricing` and `/en/download`: no errors.
- [ ] Paste a `/employer/register` link into Slack or WhatsApp: the card shows LetsHyre and the
      default image.

## First 7 days

- 404 rates, Search Console coverage and hreflang errors, CWV field data, sign-up
  conversion.
- Search Console's "Page with redirect" report should list only `http://`, `www.` and `beta.`
  URLs; postbuild fails on internal links to pages that weren't prerendered.
- After a clean week of report-only CSP: set `CSP_MODE=enforce` for the app and redeploy
  (docs/deployment.md §4.3).
- Roll back if indexed pages drop more than 10% or errors spike: re-run the previous deploy.
