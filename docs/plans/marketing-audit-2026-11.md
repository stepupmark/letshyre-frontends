# Marketing audit: November 2026

This audit covers `apps/marketing`: 317 source files, 16 routes and 19 locales. It also covers the
parts of `packages/api/src/public`, `packages/blocks/src/assistant` and `tooling/csp.ts` that the
marketing app uses. The same rules apply as for the app audit:

- write only the tests that guard something important
- remove redundant tests
- run only the tests a change affects
- keep comments short

## Overall picture

The app is in good shape. Every API response is checked with Zod, and the CSP uses hashes. The
build script checks SEO, the URL contract, `llms.txt` and the JS budget. Links in assistant
replies go through `safeUrl`, and the contact form has a bot trap and keeps drafts.

What's left is three kinds of work:

- launch steps that still depend on the host
- one gap in cookie consent
- clean-up from the home page experiments

## Phase 0: Quick fixes (about half a day)

| #   | Issue                                                                                                                                                                                       | Fix                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 0.1 | `features/download/components/release-card.tsx:54` animates `box-shadow` and adds `hover:shadow-lg`. That breaks ADR 0008 (transform and opacity only) and the "borders, not shadows" rule. | Keep `hover:-translate-y-0.5`, drop the shadow, and use `transition-transform`.                 |
| 0.2 | `features/pricing/hooks/use-price-status.ts`: `slow` never goes back to `false`. After an error, Retry shows "taking longer than usual" straight away.                                      | Reset `slow` when `waiting` turns false.                                                        |
| 0.3 | `features/contact/components/contact-hero.test.tsx` actually tests the contact form.                                                                                                        | Rename it to `contact-form.test.tsx`.                                                           |
| 0.4 | `e2e/smoke.spec.ts` "unknown pages show the 404 screen" repeats `e2e/not-found.spec.ts`.                                                                                                    | Delete the smoke copy.                                                                          |
| 0.5 | `app/lib/pages.ts:1` opens with a comment that describes who imports the file.                                                                                                              | Reword it as the constraint: "no Vite-only imports, react-router.config.ts loads this in Node". |

## Phase 1: Security and privacy (1–2 days)

**1a. Visitors can't withdraw cookie consent (GDPR / DPDP).** `components/consent-gate.tsx`
appears only while `consent` is unset. After someone accepts, nothing on the site lets them change
their mind, and the Meta Pixel keeps firing.

- Add a "Cookie settings" button to the footer (`layouts/site-footer.tsx`). It calls the existing
  `clearConsent()` from `@workspace/analytics`, so the banner appears again. The `lh_consent` cookie is
  shared with the app through `VITE_COOKIE_DOMAIN`, so the choice changes on both sites. Once the
  Pixel script has loaded, it stays loaded until the next page load, so reload after a withdrawal.
- Copy goes into all 19 locales through `pnpm i18n:apply`.
- Test: one unit test that accepting, then resetting, shows the banner again and stops page views.

**1b. The CSP is only report-only, and nothing collects the reports.** `CSP_ENFORCE` is off by
default (`scripts/postbuild.ts:42`). `tooling/csp.ts` leaves out `frame-ancestors`,
`upgrade-insecure-requests` and `report-to`. Its note says `frame-ancestors` belongs in a response
header, and the host doesn't send one yet.

- **Ops:** the host sends `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin` and HSTS, and applies `build/csp.map` and
  `build/redirects.map`. Add these to url-contract §5 so `e2e/serve.ts` checks them as well.
- Once reports come in clean for a week, set `CSP_ENFORCE=true` in the production CI build. The
  launch checklist already says this; it just needs an owner and a date.
- `report-to` waits on Phase 5 of the app audit (the error-reporting endpoint).

**1c. `style-src 'unsafe-inline'`.** This is acceptable for now, since React and motion write inline
`style` attributes. Write the reason down in ADR 0012 so it isn't quietly made broader later.

**1d. Backend error text is shown untranslated.** `contact/lib/send-error.ts` shows the server's
4xx `backendMessage` in an English sentence on a page in another language. Map the known
validation codes to translated keys. Use the backend text only for codes the map doesn't know.

## Phase 2: Functionality and content (needs a translation batch)

**2a. The audience pages are English-only.** _On hold: these pages aren't final yet, so don't
translate them. Keep them English-only until the owner says they're final._ `candidates`, `employers`, `candidateGuide` and
`employerGuide` exist only in `locales/en`. The other 18 locales have 12 of the 18 namespaces each.
This has two effects:

- those pages aren't published outside English
- `interview-guide` can't be retired in favour of `candidate-guide` (`REPLACED_BY`), because the
  successor isn't out in any other locale

Steps:

- Send the four namespaces to translation and apply them with `pnpm i18n:apply`.
- Build, check the sitemap and hreflang in `en`, `ar` and `hi`, and check the 301s in `redirects.map`.
- No new tests: `e2e/i18n.spec.ts` and `seo.spec.ts` already follow readiness.

**2b. Decide which home page wins.** _On hold: the landing page isn't final. Don't delete or
change `home`, `homeV2`, `homeV3` or their features, specs or namespaces without the owner's
say-so._ Three versions ship:

- `home` (live)
- `homeV2`, built from `features/home/components/v2`
- `homeV3`, built from `features/home-v3`

All three are prerendered in every locale, and `homeV2` and `homeV3` are noindex. That's about
40 extra components, two namespaces and two e2e specs to maintain.

- Pick the winner with the product owner, and move it to `_index` if it isn't already there.
- Delete the losing routes, features, namespaces, `PREVIEW_PAGES` entries and their e2e specs
  (`home-v2.spec.ts`, `home-v3.spec.ts`).
- If `/home-v2` or `/home-v3` was ever shared outside the team, add them to `MOVED_PATHS`.
- Run `pnpm knip` afterwards to catch orphans.

**2c. Loading before hydration.** `entry.client.tsx` waits for `requestAnimationFrame` and a
`setTimeout` before hydrating. In a background tab, rAF doesn't fire, so the page stays
non-interactive until it's shown. That's fine, but for the first few hundred milliseconds the
contact submit button and the download buttons are disabled or missing. Check this in Lighthouse
(INP and TBT) on a throttled mobile profile. Only change it if the numbers show a problem.

## Phase 3: Code quality

**3a. Inline queries in components.** `download/components/detected-download.tsx:18` and
`release-card.tsx:29` call `useQuery` directly. The keys do come from `queries/`, but pricing wraps
its queries in hooks. Do the same here with `useRelease(os, { enabled })` in
`download/queries/releases.queries.ts`, so components only read data.

**3b. `useMemo` and `useCallback` without a measured reason.** These are at:

- `contact-form.tsx:53` (the schema): keep it, because `useForm` holds on to the resolver
- `download-page.tsx:16`
- `pricing/hooks/use-money.ts:7`
- `pricing/hooks/use-plans.ts:10`

Remove the last three unless a profile shows they help.

**3c. Contact draft restore trusts storage.** `use-contact-draft.ts` casts `JSON.parse` straight to
`Partial<ContactValues>`. Parse it with a small Zod object (strings only), so a stale or tampered
value can't put non-strings into the form.

**3d. Large art files.** `interview/components/art/step-screens.tsx` (405 lines) and
`employer-guide/components/art/hiring-scenes.tsx` (364) are over the ~300-line guide. Split them
one scene per file. These are SVG art, so this is low risk and low priority.

**3e. Tests to trim.** Candidates:

- `assistant-launcher.test.tsx` has four "launcher greeting" timing cases. That's polish, not a
  critical journey; keep "opens the chat and never greets again" and drop the rest.
- `site-header.test.tsx` "ignores sub-pixel overflow" is covered by the overflow case.

## Phase 4: UI and accessibility

- **4a.** `legal/components/back-to-top.tsx` uses `shadow-md` and `backdrop-blur-md`. A floating
  control can keep a shadow, but copy the app's `shadow-raised` token into
  `apps/marketing/app/styles/app.css` so dark mode matches.
- **4b.** The assistant launcher (home only) and the consent banner both sit in the bottom corner
  on first visit. Check at 360 px in `en` and `ar` that the banner doesn't cover the launcher or its
  greeting, and push the launcher up while the banner is open if it does.
- **4c.** `not-found-art.tsx` and `route-error-art.tsx` use `drop-shadow-sm`. Switch them to the
  shared raised token, or remove it.
- **4d.** _On hold with 2a._ Check each of the four newly translated audience pages in Arabic and Urdu (RTL) at 360,
  768 and 1280 px before they ship (from Phase 2a).

## Phase 5: Launch dependencies (blocked on ops)

These come from `docs/launch-checklist.md` and still have no owner:

1. The host applies `csp.map`, `redirects.map`, the 404 fallback and the security headers from 1b.
2. Production env values are set in CI. `VITE_META_PIXEL_ID` is required, and the schema enforces it.
3. A clean week of report-only CSP, then `CSP_ENFORCE=true`.
4. Search Console and Bing verified by DNS, then the sitemap resubmitted.

## Suggested order

Phase 0, then 1a, 1d and 3. Phase 3 must not touch the home page features (`features/home`,
`features/home-v3`). 2a, 2b and 4d wait for the owner. 1b and Phase 5 go in parallel with ops.
Nothing starts until the owner says so.

## Checks run for this audit

- Lint: clean.
- Typecheck: clean.
- Build: passes. Postbuild checked 158 pages and wrote the sitemap, robots and `llms.txt`. The CSP
  stays report-only because `CSP_ENFORCE` is unset.
- Knip: clean.
