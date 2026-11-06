# apps/app audit and implementation plan

Audit of `apps/app` (plus the `packages/auth` and `packages/api` code it runs on) on 2026-11-06,
at `2b51cb3a`. It covers security, code quality, functionality and UI. Each finding names the file
and how to fix it, then the work is grouped into phases that can each ship as one PR.

## How it was checked

- Read the auth, HTTP, upload, CSP and draft code, then every place an API path, `href`, HTML string
  or stored value crosses a trust boundary.
- Ran `pnpm --filter app lint`, `pnpm --filter app typecheck` and `pnpm knip`.
- Grepped every feature against the rules in `CLAUDE.md` and `apps/app/CLAUDE.md`: Zod at the edge,
  `useMutation` only in `mutations/`, query keys only in `queries/`, async states, tokens, motion,
  logical properties and locale coverage.
- Unit and e2e suites were not run, because nothing was changed.

| Check       | Result                                                                        |
| ----------- | ----------------------------------------------------------------------------- |
| `lint`      | **Fails**: 3 errors in `send-result.tsx` (from `30fc636a`), 1 warning         |
| `typecheck` | Passes                                                                        |
| `knip`      | Passes                                                                        |
| Locales     | All 19 complete. ja, ko and id only lack `_one` plurals, which they don't use |

## What is already in good shape

These parts were checked and need no work:

- Route params are checked (`isJobId`, `isRecordId`, `isShareId`) before they go into API paths, so
  a crafted URL can't steer a request to another endpoint.
- `safeNext` resolves redirect targets the way a browser does, and every outbound `href` to an API
  file goes through `safeUrl`.
- The invitation preview runs in a sandboxed iframe with no scripts. Merge values are escaped, and
  links in the editor are limited to `http(s)`, `mailto` and `{{invite_link}}`.
- Assistant replies render through `react-markdown` (no raw HTML), with links filtered.
- Token refresh happens once at a time across tabs (Web Lock), keeps the session on network
  errors, and saves the rotated refresh token.
- Checkout reuses an order when the payer retries, re-checks the amount against the quote, and warns
  before unload while verifying.
- No `any`, no `@ts-ignore`, no TODOs, and no HTTP calls in components.

## Findings

Severity: **H** fix now, **M** fix this cycle, **L** fix when you're next in the file.

### Security and data hygiene

| #   | Sev | Finding                                                                                                                                                                                                                                                                                                                                                                      | Where                                                                                                                                                  |
| --- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S1  | M   | **Drafts outlive the account that wrote them.** Drafts and staged files are cleared only by the sign-out button. When a session expires and someone else signs in on the same browser, the earlier user's onboarding draft and files load into the new account. These can include PAN, GSTIN, phone, address, resume and KYC documents. The keys don't record who owns them. | `app/lib/draft.ts`, `app/lib/file-store.ts`, `app/features/shell/hooks/use-sign-out.ts:15`, `app/features/auth/components/sign-in/session-gate.tsx:47` |
| S2  | M   | **A half-cleared session gets stuck.** `readSession()` decides "signed in" from the `user` key alone. If `user` is there but the tokens aren't (a legacy leftover, or keys cleared by hand), every call returns 401. The refresher then returns `false` without clearing the session, so the expired-session prompt never opens and every page shows an error.               | `packages/auth/src/refresh.ts:48`, `packages/auth/src/session.ts:106`                                                                                  |
| S3  | L   | **Email button links aren't checked.** Stored or pasted template HTML becomes button nodes with `data-href` taken as is, skipping the `allowedHref` check that text links get. A template with `javascript:` in a button reaches the editor and the outgoing email. The preview sandbox blocks it there, but recipients' mail clients don't all do the same.                 | `app/features/invitations/lib/editor/email-button.ts:37`, `app/features/invitations/lib/template-html.ts:40`                                           |
| S4  | L   | `escapeHtml` in merge fields doesn't escape `'`. Today's templates use double-quoted attributes, but a single-quoted `href='{{candidate_name}}'` from the API would break out of the attribute.                                                                                                                                                                              | `app/features/invitations/lib/merge-fields.ts:37`                                                                                                      |
| S5  | M   | **CSP can't be checked from the repo.** The policy is written to `build/csp.map` and only goes into the page when `CSP_ENFORCE=true`, which nothing in the repo sets. Production depends on an nginx config that lives elsewhere. The policy also has no `report-to`/`report-uri`, so a violation in production goes unnoticed.                                              | `apps/app/scripts/postbuild.ts:42`, `tooling/csp.ts`                                                                                                   |
| S6  | L   | `img-src` allows `https://letshyre.com`, but the product domain is `letshyre.ai`. Confirm who owns `.com`. If it's not ours, an outside host can serve images into the app.                                                                                                                                                                                                  | `apps/app/scripts/postbuild.ts:28`                                                                                                                     |
| S7  | —   | Tokens in `localStorage` are a known, accepted risk (ADR 0005, `docs/security/token-storage.md`). Moving to an httpOnly cookie needs the backend first, so it isn't in this plan.                                                                                                                                                                                            | —                                                                                                                                                      |

### Functionality

| #   | Sev | Finding                                                                                                                                                                                                                                                                                                    | Where                                                                       |
| --- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| F1  | H   | **CI is red on `main`.** Lint fails with 3 errors: canonical `p-5` (line 67) and a literal SVG path string (line 151).                                                                                                                                                                                     | `app/features/invitations/components/send/send-result.tsx`                  |
| F2  | M   | **A paid order can lose its proof.** If verification fails, the Razorpay proof is kept only in React state. If the dialog closes or the tab reloads in the "unconfirmed" stage, the retry is gone, and the payer has been charged without getting credits unless the backend reconciles through a webhook. | `app/features/billing/mutations/use-checkout.ts:94-107,185`                 |
| F3  | M   | **`verifyPayment` trusts a missing body.** A `null` or non-object response counts as verified, so the UI shows "paid". Parse it with Zod and require `success: true`.                                                                                                                                      | `app/features/billing/services/billing.service.ts:20`                       |
| F4  | M   | **Job pickers show only the first page of jobs.** `useJobOptions` reads page 1 of `employer_jobs`. Employers with more jobs than that can't choose older jobs when sharing a scorecard or sending invitations.                                                                                             | `app/features/employer-jobs/queries/use-job-options.ts:6`, used by 4 routes |
| F5  | L   | The candidate dashboard renders before `myProfileQuery` resolves and redirects afterwards, so a candidate without a profile sees the dashboard briefly. If the query fails, they stay on it.                                                                                                               | `app/layouts/employee-layout.tsx:18`                                        |
| F6  | L   | A failed upload shows one generic state. Size, type, network and server errors look the same, and the error goes only to `console.error`.                                                                                                                                                                  | `app/hooks/use-file-upload.ts:67`                                           |
| F7  | L   | A failed unlock shows `panel.failed` whatever the cause. An out-of-credits or already-unlocked reply should say so, and the "credits left" line in the success toast is worked out from the cached balance rather than read from the response.                                                             | `app/features/candidate-unlock/components/unlock-panel.tsx:57-80`           |

### Code quality (rule drift)

| #   | Sev | Finding                                                                                                                                                                                                                                                                                                                           | Where                                                                                                                                                                                                                                                                                        |
| --- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | M   | **11 components call `useMutation` directly.** The rule is one hook per action in `mutations/`. Invalidation logic is copied between files: `SHARED_LINKS_KEY` 3 times, and credits plus interviews in the unlock panel.                                                                                                          | auth: `forgot-flow`, `password-stage`, `code-step`, `sign-in-form`. candidate: `share-form`, `shared-link-actions`, `shared-links`. `candidate-onboarding/onboarding-form`, `candidate-onboarding/steps/resume-step`, `candidate-unlock/unlock-panel`, `employer-onboarding/onboarding-form` |
| Q2  | M   | **Some responses skip Zod.** auth (`auth.service.ts` casts to `Body`), unlock, team add/update, company save, KYC submit, apply-for-job and payment verify all use responses unparsed. Where the UI reads the result, as auth does with session keys and as the unlock and verify results should be read, the shape is unchecked. | `features/auth/services/auth.service.ts:9`, `features/candidate-unlock/services/*`, `features/team/services/*`, `features/company-profile/services/*`, `features/employer-onboarding/services/*`, `features/billing/services/*`                                                              |
| Q3  | L   | `useJobOptions` is a React hook kept in `queries/`. Under ADR 0016 it belongs in `hooks/`.                                                                                                                                                                                                                                        | `features/employer-jobs/queries/use-job-options.ts`                                                                                                                                                                                                                                          |
| Q4  | L   | `billing/lib/checkout.ts` exports its own `safeNext` next to `@workspace/auth`'s `safeNext`. They do different jobs under the same name. Rename it `employerNext`, or build it on the shared one.                                                                                                                                 | `features/billing/lib/checkout.ts:40`                                                                                                                                                                                                                                                        |
| Q5  | L   | A query key is written inline in a shared component.                                                                                                                                                                                                                                                                              | `app/components/date-popover.tsx:37`                                                                                                                                                                                                                                                         |
| Q6  | L   | The money paths have no tests: `useCheckout` (state machine, order reuse, price change, unconfirmed retry) and the refresher's no-token branch. The rules ask for tests on money and sessions.                                                                                                                                    | `features/billing/mutations/use-checkout.ts`, `packages/auth/src/refresh.ts`                                                                                                                                                                                                                 |

### UI and accessibility

| #   | Sev | Finding                                                                                                                                                                                                                                                                                           | Where                                                                                                                                            |
| --- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| U1  | M   | Interview audio and video have no captions or transcript; `media-has-caption` is switched off. Employers reviewing answers and candidates reviewing their own get no text version (WCAG 1.2.1). Show the transcript if the API has one, or ask the backend for it.                                | `features/candidate/components/scorecard/answer.tsx:64`, `features/candidate/components/recording.tsx:49`                                        |
| U2  | L   | The unlock reveal animates `filter: blur`. ADR 0008 allows `transform` and `opacity` only, and blur is costly on low-end phones.                                                                                                                                                                  | `features/candidate-unlock/components/unlock-panel.tsx:28`                                                                                       |
| U3  | L   | 10 drop shadows use hard-coded `rgb(15 23 42 / …)`. They break "borders, not shadows" and get past the palette lint, and the slate tint doesn't change in dark mode. Keep shadows on floating layers (popover, the bulk-action bar). Elsewhere use borders, or a token such as `--shadow-raised`. | `features/candidate-onboarding/**`, `features/employer-onboarding/**`, `features/auth/components/art/**`, `features/interview-guide/**`          |
| U4  | L   | Text set at 10–11 px (`text-[0.625rem]`, `text-[0.6875rem]`), below the `text-xs` floor in the design standard. Most of it sits in preview cards and guide scenes. It's fine if purely decorative and `aria-hidden`; otherwise use `text-xs`.                                                     | `features/candidate-onboarding/components/preview/*`, `steps/role-option.tsx`, `features/interview-guide/components/scenes/interview-scenes.tsx` |
| U5  | L   | F5, F6 and F7 are also UX problems: say why an upload failed, and say why an unlock was refused.                                                                                                                                                                                                  | see above                                                                                                                                        |

### Observability

| #   | Sev | Finding                                                                                                                                                                                                                                                                                         |
| --- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O1  | M   | Nothing reports errors from production. Route errors, Zod `ResponseShapeError`s from API drift, failed payment verifications and CSP violations are invisible. Choosing a vendor is a product decision, and it needs a `connect-src` entry and consent handling through `@workspace/analytics`. |

## Implementation plan

Each phase is one PR scoped to `app` (or `auth` for phase 1b). Run only the tests for files you
touch, as `CLAUDE.md` says.

### Phase 0: make CI green (S, same day)

1. `send-result.tsx`: run `pnpm --filter app exec eslint --fix` on it for `p-5`. Move the check-mark
   `d` string into a module constant outside JSX, or use a lucide `Check` icon.
2. Done when `pnpm --filter app lint` exits 0.

### Phase 1a: drafts belong to one account (S1, M)

1. Give `draft.ts` and `file-store.ts` an owner. Save `draft:v1:owner` (the user's id or lowercased
   email from `readSession()`) with the first draft.
2. Add `clearAccountData()` in `app/lib/` that runs `clearAllDrafts()`, `clearStoredFiles()` and
   clears the assistant chats. Call it from `useSignOut`, and from a `subscribe()` listener in
   `root.tsx` whenever the session goes from signed in to guest. A refresh failure in this or
   another tab then clears them too.
3. When reading, drop any draft whose owner isn't the signed-in user. This covers drafts saved
   before the change.
4. Tests in `lib/draft.test.ts`: a draft from user A isn't returned to user B, and drafts are cleared
   when the session ends.
5. Keep the session gate's "same user signs back in" path. A re-auth must not lose what's typed, and
   only an account switch clears.

### Phase 1b: stuck sessions (S2, S, `packages/auth`)

1. In `refresh.ts`, when there's no refresh token but `readSession()` is signed in, call
   `clearSession()` and `onExpired()` before returning `false`.
2. Optionally, have `readSession()` treat a `user` with no access or refresh token as a guest. That
   catches the case before the first request.
3. Add one test next to the existing refresher tests with MSW: `user` set, no tokens, 401 → session
   cleared, `onExpired` called once.

### Phase 1c: invitation HTML hardening (S3, S4, S)

1. Move `allowedHref` from `extensions.ts` into `lib/link.ts` and export it. In `email-button.ts`
   `parseHTML`, fall back to `{{invite_link}}` when `allowedHref` fails. Apply the same check in
   `fromEditorHtml` before saving.
2. Escape `'` as `&#39;` in `escapeHtml`.
3. Add a case to `template-html.test.ts`: a button with `javascript:` loads with the invite link
   instead.

### Phase 1d: CSP you can verify (S5, S6, decision needed)

1. Agree with whoever runs nginx that `build/csp.map` is sent as `Content-Security-Policy` (not
   `-Report-Only`), with `frame-ancestors 'none'`. Write that in `docs/security/`.
2. Add `report-to` / `report-uri` once there's somewhere to send reports (see O1).
3. Confirm who owns `letshyre.com`. Remove it, or switch to the `.ai` asset host.

### Phase 2: money and correctness (F2, F3, F4, F7, Q6, M)

1. **F3**: give `verifyPayment` a Zod envelope (`unwrap` / `acknowledge`) and require
   `success: true`. Treat anything else as unconfirmed.
2. **F2**: keep `{ order, proof }` in `sessionStorage` (`checkout:pending`) from the Razorpay success
   handler until verification succeeds. When the billing page loads, if a pending proof exists, open
   the outcome dialog in the "unconfirmed" stage and retry. Clear it on success or after support
   contact. Ask the backend whether a Razorpay webhook already credits orders as well.
3. **F4**: replace the first-page `select` with an option list that covers every job. Either use an
   `employer_jobs` `limit`/`page_size` if the API supports one, or switch to a searchable combobox
   that queries as the user types. Move the hook to `hooks/` (Q3). Confirm the page size against
   staging first.
4. **F7**: map unlock errors with `errorKey` (insufficient credits, already unlocked). Read the new
   balance from the unlock response if it's there, parsed with Zod; otherwise wait for the
   refetched credits before showing "credits left".
5. **Q6**: tests for `useCheckout` (React Testing Library `renderHook` with mocked services). Cover:
   price change resets the order; closing Razorpay keeps the order for a retry; failed verification
   moves to unconfirmed and `retryConfirm` succeeds; a pending proof survives a remount.

### Phase 3: bring features back in line with the data rules (Q1, Q2, Q4, Q5, M, one PR per feature)

1. For each of the 11 components, move the `useMutation` into
   `features/<name>/mutations/use-<action>.ts`, with invalidation keyed from `queries/`. Remove the
   copied invalidation lists.
2. Add response schemas to `schemas/` for each unparsed service whose result the UI reads: auth
   (OTP session key, register, reset), unlock, team member, company save, KYC submit. For calls
   whose body the UI never reads, use `acknowledge()`, so a `success: false` on a 200 still throws.
3. Rename billing `safeNext` → `employerNext` (Q4). Move the calendar-locale key into a shared
   `queries` helper (Q5).
4. Order: auth → candidate → candidate-unlock → onboarding (both). Auth first, because it shapes the
   session.

### Phase 4: UI and accessibility (U1–U4, F5, F6, L to M)

1. **U1**: show `transcript` (or the field the API uses) under each recording. Check the scorecard
   fixture for one. If there isn't one, raise it with the backend and add an "audio only" note.
2. **U2**: replace blur with opacity plus a small `y` translate, using `duration.base`.
3. **U3**: add a `shadow-raised` token in `app/styles/app.css` (light and dark). Use it on true
   overlays and remove it from inline cards. Run a visual pass in `/_lab`.
4. **U4**: raise to `text-xs`, or mark decorative scene text `aria-hidden`.
5. **F5**: put the profile-complete check in a `clientLoader` / middleware on the employee layout
   (`queryClient.ensureQueryData(myProfileQuery())`), so the redirect happens before render.
6. **F6**: carry the failure reason into the upload state (`tooLarge`, `type`, `network`,
   `server`) and show it with copy in all 19 locales via `pnpm i18n:apply:app`. Remove the
   `console.error`.

### Phase 5: observability (O1, decision needed)

1. Choose an error reporter, or a small first-party `/client-errors` endpoint on the API.
2. Report from `RouteError`, from `ResponseShapeError` (API drift), from checkout's unconfirmed
   stage, and from CSP `report-to`.
3. Write it up as an ADR, add its origin to `connect-src` in `postbuild.ts`, and add its `VITE_*`
   variable to the env schema, `.env.example` and `ci.yml`.

## Order and effort

| Phase           | Effort   | Depends on                            |
| --------------- | -------- | ------------------------------------- |
| 0 CI            | < 1 h    | —                                     |
| 1a drafts       | ~1 day   | —                                     |
| 1b auth         | ~2 h     | —                                     |
| 1c invitations  | ~2 h     | —                                     |
| 1d CSP          | ~1 h dev | ops answer                            |
| 2 money         | 2–3 days | backend answers on webhook, page size |
| 3 data rules    | 3–4 days | best after 2 (shares billing files)   |
| 4 UI/a11y       | 2–3 days | transcript field from backend         |
| 5 observability | 1–2 days | vendor decision                       |

Phases 0, 1a, 1b and 1c touch separate files and can run in parallel. Phase 2 comes before
phase 3's billing and unlock work, because both edit the same files.

## Questions for the backend and ops

- Does a Razorpay webhook credit orders when the client's verify call never arrives?
- What is the `employer_jobs` page size, and does it take `limit` / `page_size`?
- Do interview answers have a transcript field?
- Is `csp.map` sent as an enforced header in production, and who owns `letshyre.com`?
