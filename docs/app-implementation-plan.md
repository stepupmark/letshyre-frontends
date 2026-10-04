# Implementation Plan: App (Auth, Employer, Employee): Phases 5–8

> Companion to [migration-plan.md](./migration-plan.md) (the _what and why_) and
> [implementation-plan.md](./implementation-plan.md) (Phases 0–4, marketing, done).
> This document is the _how_ for the client-rendered part of the product: sign-in and registration,
> the employer dashboard and the employee (candidate) dashboard. It builds a new `apps/app` and
> retires `apps/legacy`. The app is redesigned, not ported: §2 sets the design, UX and motion
> standard every screen is built to.
> Written 2026-10-04, after Phase 4. Revised the same day to add design, UX and motion.
> Status: **draft for approval**.

---

## 0. What we are migrating

Measured from `apps/legacy/app` (source lines without tests).

| Area                 | Legacy code                                                                                   | Size                     | Screens |
| -------------------- | --------------------------------------------------------------------------------------------- | ------------------------ | ------- |
| Auth                 | `components/auth/**`, `features/{get-started,forgot}`, `hooks/useAuth`, `services/auth`       | ~2,000 lines             | 6       |
| Employer             | `features/employer/**` (+ `pricing` checkout, `scorecard-sharing`)                            | ~15,300 lines, 116 files | 17      |
| Employee             | `features/employee/**`                                                                        | ~6,300 lines, 59 files   | 8       |
| Shared views         | `features/{scorecard,candidate-profile}`                                                      | ~1,600 lines             | –       |
| Public (not indexed) | `/shared-scorecard/:shareId`                                                                  | in `scorecard-sharing`   | 1       |
| Platform             | axios client + refresh queue, `requireAuth`, `catalogLoader`, `queryKeys`, error-message maps | ~1,000 lines             | –       |
| i18n                 | 13 app namespaces (`auth`, `dashboard`, `employer`, `employerJobs`, `employerCandidates`, …)  | ~1,400 keys × 19 locales | –       |
| Tests                | 36 test files, almost all in `employer` and `pricing`                                         | –                        | –       |

**Backend surface:** 50 endpoints (`/user/v1/*`, `/payment/v1/*`, `/commonapp/v1/*`, `/finances/v1/*`).
49 GET, 26 POST, 6 PATCH, 3 DELETE calls. Multipart uploads in 6 places (resume, JD, photo, KYC,
profile logo, onboarding review). One blob download (desktop installer). The camera is used for
the candidate's profile photo (`getUserMedia`). The AI interview itself runs in the desktop app, not
in the browser.

**Third-party in the app:** Razorpay Checkout (script + iframe), `react-joyride` (product tour),
`react-markdown` (assistant), `framer-motion` 13 (replaced by `motion`, §2.5). No analytics scripts
load in the app (Meta conversions move server-side, see B3).

---

## 1. Decisions

### 1.1 Recommended: incremental rollout on the current origin (needs your yes at 🔵 5)

The [migration plan](./migration-plan.md) ships the whole app at once in Phase 7 on
`app.letshyre.ai`. I recommend shipping it **one feature at a time on `letshyre.ai` instead**,
then moving the finished app to the subdomain in one step at the end.

|                  | Big-bang (current plan)                                      | Incremental (recommended)                                                                                                                     |
| ---------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| First user value | After all 12 slices (~7–9 weeks)                             | After the first slice (~2–3 weeks)                                                                                                            |
| Risk per release | Every screen at once, plus a domain move and forced re-login | One feature. Rollback = flip one nginx route back to legacy                                                                                   |
| Session          | Re-login when the app moves                                  | Same origin, same `localStorage` keys: users move between old and new screens without noticing. One re-login at the subdomain move, as before |
| Cost             | –                                                            | A route manifest shared by nginx and the new app (step 5.8), and hard navigations between old and new screens                                 |

The interim nginx config already does this for marketing versus legacy, so the mechanism is proven.
One extra cost with a redesign: old and new screens look different side by side for a few weeks.
Slices are grouped by area (all of jobs at once, all of billing at once) so a user's task never
crosses the boundary mid-flow (R12).

### 1.2 Carried over from Phases 0–4

React Router 8 (SPA mode for the app) · shadcn default theme, components never edited · inline
Tailwind · feature folders with lint-enforced boundaries · `@workspace/*` packages · TanStack Query +
Zod-parsed responses · RHF + Zod forms · i18next with typed keys · Playwright + axe · CSP with hashes ·
light theme forced through `@workspace/blocks/theme-provider`.

Lessons from Phases 3–4 that become rules here:

- **Measure first paint with JS on.** Hydration ran before first paint on marketing; the app hydrates
  after paint too (`entry.client.tsx`), and its Lighthouse budget is set from a measurement, not a guess.
- **Don't lazy-load anything a user can click right after load.** A lazy form fell back to a native
  GET submit (the newsletter bug). Lazy-load only below-the-fold, non-form code. Motion features are
  safe to lazy-load because nothing waits on them (§2.5).
- **Per-locale test sweeps run in Chromium only.** Every other browser checks English. The full
  marketing sweep went from 30 to 13 minutes this way.
- **`z.config({ jitless: true })`** wherever zod runs in the browser, or the CSP reports `eval`.
- **Check the font actually renders.** The theme named a font family that didn't exist (fixed in 4.x).

### 1.3 Decisions needed

| #   | Question                                                                                                                                                                                                                                                                               | Needed by |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| D6  | ~~Incremental rollout~~ **Approved at 🔵 5:** incremental rollout on `letshyre.ai` (§1.1).                                                                                                                                                                                             | 🔵 5      |
| D7  | **Taken in 6.2 (recommended option):** one sign-in page for both roles (`/sign-in`; the API returns the role)? Today there are two (`/employer/sign-in`, `/employee/sign-in`); both would redirect.                                                                                    | 6.2       |
| D8  | **Taken in 6.3 (recommended option):** drop the modal tour (`react-joyride`) for a setup checklist on the dashboard plus one-time contextual tips on shadcn `Popover` (§2.4). Alternative: keep joyride, restyled.                                                                     | 6.3       |
| D9  | ~~Data tables~~ **Settled in 5.6:** `@tanstack/react-table` v9 (shadcn's `data-table` pattern) for jobs, applicants, candidate pool, invoices, team?                                                                                                                                   | 5.6       |
| D10 | ~~Numerals~~ **Settled in 5.0:** Outfit has tabular figures (`tnum`), measured in the lab; no second font.                                                                                                                                                                             | –         |
| D11 | **Colour:** the shadcn neutral theme stays as is, no brand accent on `--primary`. Status colours are new tokens (`success`, `warning`, `info`, `danger`) added next to the shadcn ones, because lint blocks palette classes. Confirm?                                                  | 🔵 4      |
| D12 | **Deferred to "later" in 6.2** (no events sent yet; needs a backend endpoint). **UX metrics:** a few first-party product events (task started/completed, step reached) sent to our own backend, so the UX targets in §2.6 can be measured. No third-party analytics. Yes / later / no? | 6.2       |

### 1.4 What the backend needs to provide

| #   | Item                                                                                                                                                 | Needed by | Blocks                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------- |
| B1  | **Staging API** with Razorpay **test keys**, plus test accounts: employer (onboarded), employer (not onboarded), employee (complete), employee (new) | 5.7       | E2E fixtures, every UAT, the billing slice         |
| B2  | **OpenAPI schema** (drf-spectacular), if available. Otherwise we write Zod schemas by hand from captured responses                                   | 5.2       | Speed and accuracy of every slice                  |
| B3  | Meta **Conversions API** for `CompleteRegistration` and `Purchase`, so the app loads no pixel                                                        | 6.2, 6.8  | Conversion tracking after cut-over                 |
| B4  | **CORS** for `app.letshyre.ai` (credentials allowed, explicit origin)                                                                                | Phase 7   | Subdomain move                                     |
| B5  | Optional, recommended: **httpOnly refresh-token cookie** with `Domain=.letshyre.ai` ([token-storage.md](./security/token-storage.md))                | Phase 7   | Removes the forced re-login and the XSS token risk |
| B6  | Nice to have, for the UX targets: dashboard "needs attention" counts in one call, and a job-draft endpoint (autosave). Workarounds exist for both    | 6.3, 6.5  | Fewer requests, drafts across devices              |
| B7  | Applicant status (shortlist, reject) per job, and search, sort and filters on the jobs list. Until then applicants are reviewed, not triaged         | 6.5       | Bulk applicant actions, job filter chips           |

---

## 2. Design, UX and motion

The legacy app is a port of whatever was built first. This one is designed. The standard below is
what every screen is reviewed against; the visual direction is proven in code at 🔵 4 before the
shell is built.

### 2.1 Direction: a calm, precise work tool

LetsHyre's users are recruiters screening many candidates and candidates going through a stressful
process. Both need the same thing from the UI: clarity, speed and trust in what the AI says.

- **Content first.** Candidates, scores and jobs are the interface. Chrome (sidebar, headers, cards)
  is quiet: borders and whitespace, not shadows and fills.
- **Typography carries hierarchy.** Few sizes, clear weights, tabular numbers (D10), real sentence-case
  headings. No gradient text, no all-caps labels.
- **Colour means something.** Neutral shadcn theme (D11). Colour appears only for status, score bands
  and warnings, always with a label or icon as well, never colour alone.
- **Density where work happens.** Tables and lists are compact (40px rows, comfortable option);
  forms and onboarding are spacious and single-column.
- **Light theme only.** `forcedTheme="light"` stays; a dark `prefers-color-scheme` doesn't switch the
  app. The dark tokens in `@workspace/ui` stay untouched, so a toggle later is one change (backlog).

**What makes a UI look AI-generated, and is banned in review:**

| Don't                                                              | Do instead                                                                  |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Purple/blue gradients, glow, glassmorphism, sparkle icons for "AI" | Plain text: "Parsed from your JD · review the fields". AI shown by evidence |
| A grid of identical stat cards with trend arrows as the dashboard  | A "needs your attention" list with actions; numbers only where decided on   |
| `rounded-2xl shadow-xl` cards nested in cards                      | Default shadcn radius, one level of card, borders for separation            |
| Emoji in headings, "Welcome back, John! 👋"                        | The page name as `<h1>`, the user's name in the menu                        |
| Everything centred, hero-style empty states with big illustrations | Left-aligned layout; empty states with one sentence and one primary action  |
| Vague copy ("Oops! Something went wrong")                          | What happened, what's kept, what to do: "Upload failed. Your file is kept." |
| Animation on every element, staggered fade-ins on every page load  | Motion only where it explains a change (§2.5)                               |
| Fake precision ("87.4% match")                                     | Bands and reasons: "Strong match · 4 of 5 must-have skills"                 |

### 2.2 Visual system (on shadcn defaults, nothing edited)

- **Layout:** 4px spacing scale from Tailwind; content max width 72rem for pages, 40rem for forms;
  tables use the full width. Page header = `<h1>`, one-line description, actions on the right
  (sticky at the bottom on mobile for forms).
- **Type scale:** 4 sizes in the app (`text-2xl` page title, `text-base` section, `text-sm` body and
  tables, `text-xs` meta). `tabular-nums` on every number column, price and counter.
- **Status colours:** `success`, `warning`, `danger`, `info` tokens (+ `-muted` backgrounds) added to
  `globals.css` next to the shadcn tokens, with dark values ready. `StatusBadge` maps tones to them;
  each pair is checked for 4.5:1 contrast in a unit test. Score bands use the same tones.
- **Icons:** lucide at 16px in UI, 20px in navigation, stroke width default. Icons support labels,
  they don't replace them (except toolbar buttons with a tooltip and `aria-label`).
- **New shadcn components** come from the CLI (`command`, `data-table`, `chart`, `sidebar`,
  `input-otp`, `toggle-group`, `hover-card`, …) and are never edited. App variations are wrappers in
  `apps/app/app/components/`.

### 2.3 UX principles (each one is a review question)

1. **One primary action per screen.** Visible without scrolling at 360px.
2. **Every state is designed:** loading (skeleton shaped like the content, shown after 300 ms to avoid a
   flash), empty (first-time vs filtered-to-nothing are different), error (what, why, retry), partial,
   offline, permission denied.
3. **URL is the state.** Filters, sort, page, tab and open detail panes live in search params, so back,
   refresh and shared links work.
4. **Keep context.** Details open in a side `Sheet` over the list (URL-addressable) instead of a new
   page; returning restores scroll and selection.
5. **Fast by default:** prefetch on hover/focus (`prefetch="intent"`), optimistic updates for reversible
   actions (shortlist, reject, archive) with an **Undo** toast instead of a confirm dialog. Confirms are
   kept for irreversible or paid actions only (unlock, purchase, remove member).
6. **Forms that forgive:** labels above fields, one column, validation on blur and on submit (not per
   keystroke), errors next to the field and summarised at the top, correct `autocomplete` / `inputmode`,
   drafts autosaved in long forms, nothing lost on back or on a failed submit.
7. **Explain the AI.** Every AI output (JD parse, resume review, match, scorecard) shows where it came
   from, can be edited before it's used, and says how sure it is in words, not decimals.
8. **Keyboard first, touch friendly.** ⌘K / Ctrl K command palette (go to, search candidates and jobs,
   actions), `?` shows shortcuts, `j`/`k` in lists. Touch targets ≥ 44px on mobile, ≥ 24px on desktop.
9. **Accessible to WCAG 2.2 AA** (the EU Accessibility Act applies since June 2025): focus always
   visible and never hidden under sticky headers, no drag-only actions, paste allowed in OTP and
   password fields, no cognitive tests at sign-in, RTL correct for `ar` and `ur`.
10. **Respect the user's settings:** reduced motion, larger text (layouts tested at 200% zoom), the
    chosen language everywhere including dates, numbers and currency (`Intl`).

### 2.4 Experience per area

| Area                  | Key UX decisions                                                                                                                                                                                                                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth                  | Split layout (form left, short product proof right, hidden on mobile). Registration one step per screen with a step count. OTP with `input-otp`: paste, autofill, auto-submit on the last digit, resend countdown, "sent to ••••42 · change". Password rules as a live checklist. Entered data survives back/refresh. |
| Employer dashboard    | "Needs your attention" first: applicants to review, interviews finished awaiting a decision, jobs closing, credits running low, each with its action. Setup checklist for new employers replaces the modal tour (D8). Stats only for numbers the employer decides on.                                                 |
| Onboarding (KYC)      | Wizard with time estimate, save and resume, document dropzone with preview, clear "what happens next" after submit.                                                                                                                                                                                                   |
| Jobs                  | Post a job by uploading a JD: the AI fills the form and marks each filled field "From your JD" until reviewed. Autosaved draft, preview as candidates see it. List with status tabs, filters as chips in the URL.                                                                                                     |
| Applicants and pool   | Dense table with match band, key skills and status; row opens a peek `Sheet`; bulk shortlist/reject with undo; `j`/`k` navigation. Unlock button shows the price ("Unlock · 2 credits") and the balance after; insufficient credits leads straight to a top-up and back.                                              |
| Candidate + scorecard | Score as a band with per-competency evidence (transcript excerpts, timestamps that seek the recording). Print and share views. Same component for employer and candidate, wording adjusted per role.                                                                                                                  |
| Billing               | Plans compared in a table, price including GST, what credits buy in plain words. After payment: the balance updates in place, receipt link right there. Failed or cancelled payments say nothing was charged.                                                                                                         |
| Team and profile      | Invite by email with role, seat count visible, pending invites resendable. Inline edit for profile fields.                                                                                                                                                                                                            |
| Employee onboarding   | Friendly, calm tone; progress with time left; camera capture with a framing guide and retake, upload fallback; resume AI review shown as "we found these, check them" with edits inline.                                                                                                                              |
| Employee pages        | Applications as a status timeline with the next step spelled out; find jobs with saved filters; interview guide as a checklist with the desktop app download at the right moment.                                                                                                                                     |
| Assistant             | Streaming replies, stop button, suggested questions, links into the app (e.g. "open this job").                                                                                                                                                                                                                       |

### 2.5 Motion (motion.dev)

**Library:** `motion` (the current name of Framer Motion; `framer-motion` from legacy is not carried
over). Imported only as `m` from `motion/react-m` inside `LazyMotion`, features loaded asynchronously, so
the first paint carries ~10 kB gzip of motion and the `domMax` features (~29 kB) arrive after
(measured in 5.0).
Nothing is clickable only after motion loads: without it, elements simply appear.
`MotionConfig reducedMotion="user"` at the root. ESLint `no-restricted-imports` blocks `framer-motion`
and `motion` (the non-lazy component).

**Tokens** in `apps/app/app/lib/motion.ts` (durations and easings, not Tailwind classes):
`fast` 120 ms (hover, press, small fades), `base` 200 ms (enter/exit, tabs), `slow` 320 ms (sheets,
step changes), easing `[0.2, 0, 0, 1]` out, springs with `bounce: 0` for layout. Nothing in a work
flow lasts longer than 400 ms.

**Where motion is used, and why:**

| Moment                                | Motion                                                                    | What it explains                   |
| ------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------- |
| Rows added, removed, reordered        | `AnimatePresence` + `layout` (height collapse, neighbours slide)          | What changed in the list           |
| Undo toast after shortlist/reject     | Row leaves, comes back on undo                                            | The action is reversible           |
| Tabs, segmented controls, nav active  | Shared `layoutId` indicator                                               | Where you are                      |
| Wizard steps                          | Direction-aware slide (8–16px) + fade, mirrored in RTL                    | Forward vs back                    |
| Credits balance after unlock/purchase | Number ticks to the new value (`animate` on a motion value)               | Money moved, and how much          |
| Unlock                                | Hidden contact details resolve in place                                   | What the credits bought            |
| Upload, AI parse, resume review       | Determinate progress; steps checked off as the backend reports them       | Work is happening, how far along   |
| Scorecard                             | Band bars fill once on first view                                         | Relative strength, not decoration  |
| OTP / form error                      | Short horizontal shake (off with reduced motion, error text always shown) | This field, now                    |
| Sheet, dialog, popover, toast         | shadcn's own `tw-animate-css` transitions, unchanged                      | –                                  |
| Route change                          | View Transitions API through React Router's `viewTransition`, 120 ms fade | Continuity, without a page "flash" |

**Rules:** animate `transform` and `opacity` only (layout via `layout` prop, never `height: auto`
tweens in hot paths); no looping animation except a live progress state; no stagger on tables
after the first load; no animation blocks input (INP < 200 ms is a budget); CSS-only for hover and
press. With reduced motion, positions jump and only short opacity fades remain. Every motion moment is
listed in the slice's UX brief and reviewed like copy.

### 2.6 Modern platform, now and next

Used now (supported in every browser we test, with fallbacks):

- **View Transitions** for route and list-detail changes; **container queries** so table cells, cards
  and the scorecard adapt to their pane, not the window; **`:has()`** for form states; **`@starting-style`**
  and **`interpolate-size`** for CSS-only enter and expand where motion isn't needed; **OKLCH** colours
  (already in the theme); `field-sizing: content` for growing textareas; logical properties everywhere
  (`ms-*`, `pe-*`) for RTL.
- **AI-native patterns:** streaming text, editable AI output, visible provenance, undo. These are what
  users in 2026 expect from an AI product more than any visual style.

Designed for, switched on when ready (future scope, no rework needed):

- **Passkeys** (WebAuthn) as the sign-in default once the backend supports them; the sign-in screen
  leaves room for it.
- **Dark theme** toggle (tokens exist; every colour used is a token, and the status tokens already have
  dark values).
- **CSS anchor positioning** and the **Popover API** as Base UI adopts them (shadcn updates, no edits
  from us).
- **Scroll-driven animations** for long read-only views (scorecard, shared scorecard).
- **Agent-friendly UI:** semantic landmarks, real labels and stable URLs mean browser assistants and
  automation can use the app, the same properties that make it accessible.
- **Built-in browser AI** (on-device summarise/translate APIs) for the assistant, behind feature
  detection, if it becomes stable across browsers.

**UX targets** (measured with D12; until then by timed UAT runs):

| Task                                  | Target                                |
| ------------------------------------- | ------------------------------------- |
| Employer: sign-up to first job posted | < 5 min, 0 support questions in UAT   |
| Post a job from a JD                  | < 2 min, ≤ 3 field corrections        |
| Review 10 applicants                  | Keyboard only, no page loads          |
| Candidate onboarding completion       | Higher than legacy (baseline in 5.0)  |
| Every interaction                     | INP < 200 ms on a mid-range Android   |
| Any screen                            | Usable at 360px and 200% zoom, in RTL |

---

## Step overview

| Step | Title                                                                    | Est.  | Gate                             |
| ---- | ------------------------------------------------------------------------ | ----- | -------------------------------- |
| 5.0  | Design direction: UX audit, principles, prototypes of 3 key screens      | 4 d   | 🔵 4 (design direction, D11)     |
| 5.1  | `apps/app` skeleton (SPA, providers, env, CSP, budgets, motion setup)    | 1 d   |                                  |
| 5.2  | `@workspace/api`: all methods, uploads, downloads, error copy            | 1 d   |                                  |
| 5.3  | `@workspace/auth`: session, refresh, guards                              | 1.5 d |                                  |
| 5.4  | App i18n: locale resolution, whole-app readiness, key map                | 1 d   |                                  |
| 5.5  | Dashboard shell: sidebar, topbar, user menu, credits, command palette    | 3 d   | 🔵 5 (shell + rollout model, D6) |
| 5.6  | App building blocks: data table, filters, upload, wizard, states, motion | 3 d   |                                  |
| 5.7  | Test harness: API fixtures, auth fixtures, MSW, visual + motion checks   | 1 d   |                                  |
| 5.8  | Rollout infra: route manifest, nginx map, cross-app links                | 1 d   |                                  |
| 6.1  | Pilot: public shared scorecard                                           | 2 d   |                                  |
| 6.2  | Auth: get-started, sign-in, register (OTP), forgot password              | 3.5 d | 🔵 6 (first live slice)          |
| 6.3  | Employer dashboard + setup checklist                                     | 2.5 d |                                  |
| 6.4  | Employer onboarding (KYC)                                                | 2 d   |                                  |
| 6.5  | Jobs: post (JD parse), list, detail/edit, applicants                     | 5 d   | 🔵 7 (table + form patterns)     |
| 6.6  | Candidate pool, unlock, unlocked candidates                              | 3.5 d |                                  |
| 6.7  | Candidate profile + scorecard views (both roles)                         | 2.5 d |                                  |
| 6.8  | Billing (Razorpay) + invoices                                            | 2.5 d |                                  |
| 6.9  | Team, shared links, employer profile                                     | 2.5 d |                                  |
| 6.10 | Employee onboarding wizard (resume AI, photo, documents)                 | 3.5 d |                                  |
| 6.11 | Employee: profile, find jobs, applications, score cards, guide           | 3.5 d |                                  |
| 6.12 | Assistant (chatbot) for both roles                                       | 1.5 d |                                  |
| 6.13 | App translation batch + readiness                                        | 1 d   |                                  |
| 7.1  | Subdomain move: `app.letshyre.ai`                                        | 2 d   | 🔵 8 (all routes on the new app) |
| 8.1  | Decommission legacy, ADRs, `apps/admin` template doc                     | 1.5 d |                                  |

**Total ≈ 10–11 weeks of engineering** for one engineer, plus UAT turnaround per slice. The redesign
adds about 2 weeks over a straight port: the design step, the command palette, motion, and the extra
states and polish in each slice. With the incremental rollout, the first slice is live after about
3 weeks.

---

## Phase 5: App foundation

### 5.0 Design direction → 🔵 Gate 4

Design is done in code, with real data shapes, not in mockups that drift from what ships.

- **UX audit of legacy:** walk the 6 key tasks (sign up, post a job, review applicants, unlock, buy
  credits, candidate onboarding) on desktop and a phone. Record steps, clicks, time, dead ends and
  every state that's missing. Output: `docs/design/ux-audit.md` with screenshots, and the baselines
  for the targets in §2.6.
- **Design doc:** `docs/design/app-design.md` turns §2 into the review checklist used by every slice
  (states, copy, motion, a11y, RTL, 360–1920).
- **Prototypes in a dev-only `/_lab` route** (excluded from the build): employer dashboard, applicants
  table with peek sheet, and candidate scorecard, built on shadcn defaults with fixture data, with
  their motion. Shown at 360 / 768 / 1280 / 1920, in English, German (long words) and Arabic (RTL).
- **Checks:** Outfit `tnum` support (D10), status palette contrast, the font loads.
- **Done 2026-10-04:** audit and checklist written ([ux-audit.md](./design/ux-audit.md),
  [app-design.md](./design/app-design.md)); lab in `apps/app/app/lab`; D10 settled (Outfit has `tnum`).
  The timed walk-through and its baselines wait for staging (B1).
- **🔵 Gate 4:** you review the prototypes and the audit, decide D11. Changes here are cheap;
  after 🔵 5 the patterns are fixed.

### 5.1 `apps/app` skeleton

- React Router 8, `ssr: false`, **no prerender** (SPA mode emits one `index.html`).
  `routes.ts` is explicit (no `flatRoutes()`), like marketing.
- Same toolchain as marketing: Tailwind 4 + `@workspace/ui`, ESLint `reactRouterApp` preset with
  boundaries, Vitest, Playwright (chromium, webkit, mobile), knip entry, `turbo.json` outputs.
- `root.tsx`: `<html lang dir>` from the resolved locale, `ThemeProvider` (forced light),
  `MotionConfig reducedMotion="user"` + `LazyMotion` (features imported async), `QueryClientProvider`,
  `Toaster`, `TooltipProvider`, global `ErrorBoundary`, `meta` = `noindex, nofollow` on every page.
- `entry.client.tsx`: hydrate after first paint (copied from marketing).
- `lib/env.ts` + `env.schema.ts` validated in `vite.config.ts` (marketing pattern).
  Vars: `VITE_ENV`, `VITE_APP_URL`, `VITE_SITE_URL` (links back to marketing), `VITE_API_BASE_URL`,
  `VITE_COOKIE_DOMAIN`. `preview.host = 127.0.0.1`.
- `scripts/postbuild.ts`: CSP hashes for `index.html` (reuses marketing's `csp.ts`, moved to
  `tooling/` once two apps use it), JS budget **measured on the first build, then ratcheted**, with
  motion counted. Policy: `script-src 'self' <hashes> https://checkout.razorpay.com`,
  `frame-src https://api.razorpay.com`, `connect-src 'self' <api>`, `img-src 'self' data: blob: <media host>`,
  `media-src 'self' blob:`. Motion writes styles through the CSSOM, which `style-src` doesn't block.
- **Exit:** `pnpm --filter app build` and `dev` work; an empty dashboard route renders; CI runs it.
- **Done 2026-10-04:** CSP and script helpers moved to `tooling/csp.ts` (marketing policy verified
  identical on all 171 pages). Initial JS measured at 161 kB gzip, ratchet 170 kB. Media origins come
  from `VITE_MEDIA_ORIGINS` (default `https://cdn.letshyre.ai`; confirm the real hosts on staging, B1).
  The client-side `env.ts` arrives with its first user, the API client (5.2). Razorpay origins are
  verified in the billing slice (6.8).

### 5.2 `@workspace/api`: what the dashboards need

Today the client has `get` and `post`, enough for marketing. Add:

- `put`, `patch`, `delete` (same envelope and error handling; only GET is retried).
- **Multipart:** `body instanceof FormData` skips JSON encoding and the content-type header.
  Upload progress (`fetch` has none): a small `xhrUpload()` for the three large uploads
  (resume, JD, KYC documents) that reports progress and supports abort.
- **Downloads:** `getBlob(path)` for the desktop installer and invoice PDFs.
- **Error copy:** port `lib/apiErrorMessages.js` + `authErrorMessages.js` as
  `errorMessageKey(error)` → i18n key, with their existing tests. Messages rewritten to the §2.1 rule
  (what happened, what's kept, what to do).
- Pagination envelope helper (`{ count, next, previous, results }`) with a Zod factory.
- **Exit:** unit tests for each method, multipart, abort, progress, 401 hook.
- **Done 2026-10-04:** `put`/`patch`/`delete`, FormData bodies, `getBlob`, `xhrUpload` (progress, abort,
  refresh-and-retry), `refreshAuth` hook (401 → refresh → one retry), DRF `fieldErrors`, `paginated()`,
  `errorKey()`. Error copy per area (auth messages) moves in with each slice.

### 5.3 `@workspace/auth`

New package (app and future admin use it; marketing never loads it).

- **Session store:** reads and writes **the same `localStorage` keys as legacy** (`accessToken`,
  `refreshToken`, `user`) so old and new screens share one session during the rollout. Drops the
  `user.refresh_token` fallback; strips refresh tokens out of `user` on read.
- **Single-flight refresh:** concurrent 401s wait for one `login_refresh` call, rotated refresh
  token saved, bounded by a timeout. Port of `services/api.js` with its tests.
- `login`, `logout` (server revoke, then clear), `me`, `useSession()` (`useSyncExternalStore`),
  **cross-tab sync** via the `storage` event (sign out in one tab signs out all).
- Guards as `clientMiddleware`: `requireAuth({ roles })`, `requireGuest()`, employer onboarding gate,
  and the `/employer/billing` sign-in redirect with `?next=` (behaviour added in 4.5).
- Session expiry never loses work: a failed refresh during a form opens a sign-in dialog over the
  page instead of redirecting, and the form state survives.
- `ROLES`, `roleHome()`, `safeNext()` (same-site path check, already proven in legacy tests).
- **Exit:** ≥ 90% coverage; legacy's `requireAuth.test`, `useAuth.test`, `api.test`,
  `authStorage.test` cases all ported and green.
- **Done 2026-10-04:** `packages/auth` with the legacy storage keys, single-flight refresh, cross-tab
  sign-out, `login`/`logout`, `authRedirect`/`guestRedirect` (onboarding gate, billing `?next=`),
  `safeNext`, `useSession`. Tests cover the money/session-critical paths only. **Deferred to 6.2:**
  the sign-in dialog over an open form when the session expires; until then it goes to `/`.

### 5.4 App i18n

- No `/:lang` prefix. Locale = user choice → `lh_locale` cookie (shared with marketing) →
  `navigator.languages` → `en`.
- **Readiness is per app, not per page:** a locale is offered only when every app namespace is
  complete; otherwise the app falls back to English entirely. No mixed-language screens.
- Catalogs in `apps/app/app/locales/<lng>/<ns>.json`, lazy per namespace via the route `handle`.
- Dates, numbers, currency and relative times through `Intl` in the active locale, never hand-formatted.
- **Translation reuse:** extend `tooling/i18n/key-map.json` + `pnpm i18n:migrate` to the 13 app
  namespaces. Copy that is kept verbatim keeps all 18 translations; new copy goes through
  `pnpm i18n:apply` (step 6.13).
- **Exit:** typed keys for app namespaces; language switcher in the user menu writes the cookie.
- **Done 2026-10-04:** `lh_locale` → browser → English, limited to locales where every app namespace is
  complete (computed at build, `__APP_LOCALES__`); per-route `namespaces()` middleware;
  `pnpm i18n:migrate:app` with `tooling/i18n/key-map.app.json`. Only English ships today, as intended.

### 5.5 Dashboard shell → 🔵 Gate 5

- `layouts/dashboard-layout.tsx` on shadcn `Sidebar` (collapsible to icons, `Sheet` on mobile),
  `SidebarInset`, topbar with breadcrumb, credits balance (employer, animated on change), user menu
  (profile, language, shortcuts, sign out). No confirm on sign out; it's undoable by signing in.
- Two nav configs (employer, employee) as data, active state from the route with a shared `layoutId`
  indicator. Badges for counts that need action (new applicants).
- **Command palette** (shadcn `Command` in a `Dialog`, ⌘K / Ctrl K, also a search button in the topbar):
  navigation, recent items, actions per role; feature results added by each slice. `?` opens the
  shortcut list.
- Skip link, landmarks, focus moves to `<h1>` on route change, delayed progress bar (from blocks),
  View Transitions on navigation.
- **🔵 Gate 5:** you review the shell at 360/768/1280/1920 with one real page (employer dashboard
  attention list) and decide D6 (rollout model).
- **Done 2026-10-04:** `features/shell` (sidebar per role, crumbs from route `handle`, live credits,
  Ctrl K, account menu with language and sign-out, `?` shortcuts, skip link, focus on the new `<h1>`).
  The employer dashboard is still a placeholder; the attention list needs the API (6.3). Nav badges
  and recent items in Ctrl K arrive with the slices that own the data. JS ratchet raised to 200 kB.

### 5.6 App building blocks

In `apps/app/app/components/` (app-shared; moves to `@workspace/blocks` only if admin needs it):

- `DataTable` (D9): sorting, server pagination, column visibility, density toggle, row selection with
  bulk actions, keyboard row navigation, row actions, empty/error/loading rows, mobile card layout
  below `md`. Filters and page live in **search params**; filter chips with clear-all.
- `DetailSheet`: URL-driven side panel over a list (`?candidate=<id>`), previous/next within the list.
- `FileDropzone` with type/size validation, preview, progress, retry, and an accessible fallback input.
- `Wizard` (stepper + per-step validation + persisted draft + direction-aware step motion) for the two
  onboarding flows.
- `ConfirmDialog` (irreversible and paid actions only), `undoToast()` for reversible ones,
  `StatusBadge` (job, application, unlock statuses; the §2.2 palette), `ScoreBand`, `CopyButton`,
  `PageHeader`, `EmptyState` (first-time vs filtered), `QueryState` (delayed skeleton / error with
  retry / empty) wrapping every query.
- `components/motion/`: `AnimatedList` (presence + layout), `AnimatedNumber`, `StepTransition`,
  `ShakeOnError`, all reading the tokens in `lib/motion.ts` and honouring reduced motion.
- **Exit:** each block has unit + axe tests and a Playwright check on mobile and in RTL.
- **Done 2026-10-04:** D9 settled on `@tanstack/react-table` v9. `DataTable`, `DetailSheet` +
  `useDetailParam`, `FileDropzone`, `Wizard` + `lib/draft`, `ConfirmDialog`, `undoToast`, `EmptyState`,
  `QueryState`, `ScoreBand`, `CopyButton`, motion helpers. All on `/_lab/blocks`. Unit tests only for
  the logic that can lose data (URL params, file checks, drafts); axe runs per page in each slice.

### 5.7 Test harness

- **API fixtures:** capture real responses from staging (B1) for each endpoint, scrub personal data,
  commit as `e2e/fixtures/<endpoint>.json`. Every Zod schema is tested against its fixture, so a
  backend shape change fails one clear test.
- Playwright: `mockApi(page, overrides)` (marketing pattern) plus **auth fixtures** that seed
  `localStorage` for each role (employer, employer-not-onboarded, employee, guest).
- Vitest: MSW for service and query tests.
- Per-slice smoke + axe across all routes; per-locale sweeps Chromium only (§1.2).
- **Visual baselines** per slice (opt-in `VISUAL=1`, marketing pattern), screenshots taken with
  `reducedMotion: "reduce"` so animations never cause flaky diffs. A separate check runs with motion on
  and asserts no layout shift and no console errors.
- **Exit:** a sample test signs in as each role and lands on its home.
- **Done 2026-10-04:** `e2e/fixtures.ts` (auto API mock that fails on unmocked calls, `signInAs`),
  `e2e/api/*.json` fixtures, `contracts.test.ts`, role landing test, `pnpm --filter app fixtures:capture`.
  Fixtures are hand-written until staging (B1); MSW waits for the first service that needs it.

### 5.8 Rollout infrastructure (incremental model)

- `apps/app/app/lib/live-routes.ts`: the list of path patterns served by the new app. The build writes
  `build/live-routes.map` from it.
- nginx (`infra/nginx/sites/letshyre.ai.conf`): a `map` from that file decides, per request, whether
  `/employer/*`, `/employee/*`, … go to `app/current/client/index.html` or the legacy shell. Assets:
  marketing → app → legacy fallback (hashed names never collide).
- `AppLink`: a client-side `<Link>` for live routes and a full page load (`reloadDocument`) for routes
  still on legacy.
- **One small legacy patch:** legacy navigates client-side, so it would keep rendering its own copy of
  a migrated screen. A `clientLoader` on each migrated legacy route, generated from the same manifest,
  does a full page load to that URL instead, so nginx hands it to the new app.
- Docker nginx test extended: each live route serves the new app, each other route the legacy shell.
- **Exit:** a dummy live route switches between apps by editing one line; tests cover both states.
- **Done 2026-10-04:** build writes `live-routes.map` and `client/live-routes.json`; nginx serves live
  paths from the app (own headers, CSP), assets fall back marketing → app → legacy; legacy root
  middleware hands its own links to live routes over. Only `/employer/release-check` is live until
  6.1. The Docker nginx test needs CI (no Docker on this machine).

---

## Phase 6: Features (one slice = one release)

**Every slice follows the same steps:**

1. **Parity list** from the legacy screen: every behaviour, state, validation rule and API call,
   plus its legacy tests. Written into the PR before coding.
2. **UX brief** (half a page, in the PR): the user's task and success measure, every state, the
   primary action per screen, copy for errors and empty states, and the motion moments (§2.5). Checked
   against the `/_lab` patterns; anything new is prototyped there first.
3. Feature folder + thin routes, Zod schemas checked against fixtures, queries/mutations, UI built
   from the brief on shadcn defaults and the 5.6 blocks.
4. English copy, translations reused through the key map.
5. Tests: unit (schemas, services, lib), component tests for logic-heavy parts, Playwright main flow +
   axe at 360 and 1280 and in RTL, every loading/empty/error state, visual baselines.
6. **Design review** against `docs/design/app-design.md`: states, copy, motion with and without
   reduced motion, keyboard-only run, 200% zoom, a timed run of the slice's task.
7. UAT on staging with real test accounts (B1) → add the route to `live-routes.ts` → release →
   watch errors for 48 h. Rollback = remove the route from the manifest.

### 6.1 Pilot: public shared scorecard

`/shared-scorecard/:shareId`, read-only, no auth: the lowest-risk way to prove the build, nginx
switch, API client, error pages and CSP in production, and the first real use of the scorecard
design from 5.0 (band bars, evidence, print view). `noindex`, `Referrer-Policy: no-referrer`.

- **Done 2026-10-04:** public layout, report with band, meters that fill once, insights, profile,
  answers (Markdown questions, MCQ marks, code, audio), print expands every answer, TOC on wide
  screens. A refresh replays the fetched copy (links have a view limit). nginx sends
  `Referrer-Policy: no-referrer` for these paths. Not live yet: needs UAT on staging (B1).

### 6.2 Auth → 🔵 Gate 6

`/get-started` (role choice), sign-in (D7), employer and employee registration with email + mobile
OTP (`send_otp`, `verify_otp`, `mobile_send_otp`, `mobile_verify_otp`), password set, forgot password.
Keeps `?next=` and `state.from` returns. UX per §2.4: one step per screen, `input-otp` with paste,
autofill (`autocomplete="one-time-code"`) and auto-submit, resend countdown, rate-limit messages that
say when to retry, data kept across back/refresh. `CompleteRegistration` via B3.
**🔵 Gate 6:** first slice live for real users; you confirm the release and rollback process.

- **Done 2026-10-04:** `/sign-in` for both roles (old per-role URLs forward with `?next=`),
  `/get-started`, `/employer/register` and `/employee/register` (details → email code → mobile →
  SMS code → password, step in the URL, answers in sessionStorage without the password, signs the
  new account straight in), `/forgot-password` (back at sign-in with the email filled in). Guards
  send signed-out visitors to `/sign-in?next=`; the build refuses a live dashboard page unless
  `/sign-in` is live. The 5.x deferral is closed: when a session ends under an open page, a
  sign-in dialog appears over it and nothing typed is lost. Validation on blur only once a field
  has content (an empty-field error had shifted the "Forgot password?" link mid-click). Tooltips
  moved into the shell: first load 171 kB, budget lowered to 180 kB.
  **Open for UAT:** legacy sent `role` with the login request; the single page doesn't. Check the
  backend accepts that. `CompleteRegistration` still needs B3 (the app loads no pixel).

### 6.3 Employer dashboard + setup checklist

"Needs your attention" list from `employer_dashboard_cards` (B6 if the backend can merge the counts),
credits card with low-balance warning, quick actions. Per D8: a setup checklist (company details, KYC,
first job, invite team) that disappears when done, and one-time tips anchored to new controls,
dismissible, restartable from the user menu, keyboard and screen-reader usable.

- **Done 2026-10-04:** "Needs your attention" built from what the API has today (credits low or
  out, no open jobs, no jobs yet), hiring numbers that link to jobs, credits card with a ticking
  balance. Applicants to review and finished interviews need counts the API doesn't return yet
  (B6). Setup checklist (hideable, gone when done) and two one-time tips (search, credits) with
  "Show tips again" in the user menu.

### 6.4 Employer onboarding (KYC)

The onboarding gate, company details, KYC document upload (`employer_kyc`), with the persisted wizard,
document preview, and a "what happens next" screen with the review time.

- **Done 2026-10-04:** own layout (no sidebar, sign out in the header), three steps (company
  details, registration and tax, documents), drafted text fields (the legacy draft is picked up
  once), PAN and GSTIN format checks, image preview, one multipart PATCH with upload progress,
  server field errors routed to their step. "What happens next" screen after submit. No review
  time is promised: the backend has no figure to show yet.

### 6.5 Jobs → 🔵 Gate 7

Post job with JD upload and AI parse (`employer_job_jd_ai/parse`) filling a reviewable form ("From
your JD" markers), autosaved draft (B6, `localStorage` until then), candidate-view preview. Job list
with status tabs and filter chips, job detail and inline edit, applicants per job with AI match
(`employer_job_ai/matching`) as bands with reasons, peek sheet, bulk actions with undo, keyboard review.
**🔵 Gate 7:** you approve the table and form patterns here; later slices reuse them unchanged.

- **Done 2026-10-04:** `/employer/post-job` reads the JD (upload helper, since AI parsing can
  outlast the fetch timeout) into one form; every field the JD filled shows "From your JD" until
  the employer changes it. Draft on this device (the JD file stays in memory), candidate preview,
  "Fill it in myself" without a JD. Post now sends the overview as `description`; legacy sent the
  responsibilities there and dropped the overview. `/employer/view-jobs` is a table with status
  tabs (approval counts as its own tab) and bulk reopen, pause and close with Undo.
  `/employer/view-jobs/:jobId` shows the job as candidates read it, edits in place with the same
  form, changes status with Undo, deletes after a confirm. Applicants come from
  `employer_job_ai/matching` (applied only): match bands with the AI's reason, band tabs, a side
  panel stepped with j/k. **Not built, needs B7:** shortlist/reject and their bulk actions (no
  endpoint), filter chips on the jobs list (the API filters by status only). Applied date and
  pipeline status from `employer_candidate_job_management` aren't shown; UAT checks whether
  matching returns them. **UAT:** create accepts the numeric range fields beside the text ones.

### 6.6 Candidate pool, unlock, unlocked candidates

Pool search and filters, **unlock (spends credits)**: price on the button, balance after in the
confirm, details resolve in place and the balance ticks down. Insufficient credits opens a top-up and
returns to the same candidate. Unlocked list. Port all unlock tests; unlock is money-adjacent.

- **Done 2026-10-04:** `/employer/candidate-pool` picks an open job (a linked job off the first
  page still loads), AI matched or applied, and reuses the 6.5 match list. Unlock lives in the
  candidate's side panel, on the pool and on applicants: one credit per interview as before, the
  matched role's interview first, unlocked ones can't be picked again, the cost on the button,
  the balance left in the confirm, the topbar balance ticks down, and the panel turns to
  "unlocked" in place. Short on credits, the button becomes "Add credits" to
  `/employer/billing?next=<this candidate>`; **6.8 must honour `next`** (legacy billing ignores
  it). Legacy unlock tests ported as unit tests on the selection rules, plus e2e for the exact
  POST body. `/employer/unlocked-candidates` is a paged table; profile, scorecard and share links
  stay on legacy pages until 6.7. Unlock doesn't return contact details, so "in place" means the
  unlocked state and a link, not the details themselves.

### 6.7 Candidate profile + scorecard views

One `features/candidate` exporting `CandidateProfileView` and `ScorecardView` through its `index.ts`.
Used by the employer routes (unlocked candidate, applicant) and the employee routes (own scorecard),
composed in routes, so no feature imports another. Evidence linked to recording timestamps, interview
recording player, share link creation with copy and expiry, print view.

### 6.8 Billing + invoices

`/employer/billing?checkout=<key>` (contract from Phase 4), plan comparison, top-ups, Razorpay Checkout
(`create_razorpay_order` → widget → `verify_razorpay_order`), price-changed and cancelled states in
plain words ("nothing was charged"), balance updated in place after payment, invoices with PDF
download. Razorpay script loaded on demand; CSP allows only its origins.
**Exit includes a real Razorpay test-mode purchase on staging** (the item open since Phase 4).

### 6.9 Team, shared links, employer profile

Invite and remove team members, seat limits from the plan shown before inviting, pending invites
resendable, shared links list and revoke (with undo while the toast is open), company profile inline
edit with logo upload and crop preview.

### 6.10 Employee onboarding wizard

Identity, **photo via camera** (`getUserMedia`, framing guide, retake, upload fallback and clear
permission-denied help), resume upload with AI review polling (`candidate_resume_ai/upload` →
`status/:id` → `review_data/:id`, polled with TanStack `refetchInterval`, stopped on done/error/unmount,
progress shown as named steps), "we found these, check them" review with inline edits, skills for role,
preferences, documents. Draft in Zustand `persist` without `File` objects (legacy behaviour).

### 6.11 Employee pages

Profile view and inline edit, find jobs (filters in the URL, saved searches), my applications as a
status timeline with the next step, score cards list + detail, interview guide as a checklist, link to
the desktop app download (marketing page).

### 6.12 Assistant

Reuse marketing's assistant feature as a shared block (`@workspace/blocks` or a small package) in
signed-in mode (session id per user), in the sidebar as a page and a sheet. Streaming replies, stop,
suggested questions per page, links into the app.

### 6.13 App translation batch

Everything new or reworded since the key-map migration, through `pnpm i18n:apply`, reviewed by a
native speaker per locale before the locale is switched on (§5.4). Each locale gets one visual pass
for overflow (German, Tamil) and RTL (Arabic, Urdu).

---

## Phase 7: Subdomain move

### 7.1 `app.letshyre.ai` → 🔵 Gate 8

Preconditions: every app route is in `live-routes.ts`, legacy serves nothing, B4 done (and ideally B5).

- New nginx server block for `app.letshyre.ai` (SPA fallback, CSP, `noindex`), HSTS with
  `includeSubDomains` once every subdomain is HTTPS.
- `letshyre.ai/{employer,employee,get-started,forgot-password,shared-scorecard,sign-in}/*` → **301**
  to the same path and query on `app.letshyre.ai`. Shared scorecard links already sent keep working.
- Marketing `VITE_APP_URL=https://app.letshyre.ai`, rebuild.
- **Session:** `localStorage` does not cross origins. Without B5, users sign in once more; an in-app
  banner a week before and a clear message on the sign-in page. With B5, the refresh cookie on
  `.letshyre.ai` signs them in silently.
- Monitor sign-in success rate and error rate for 7 days. Rollback: remove the 301s.

---

## Phase 8: Decommission

### 8.1 Cleanup

- Delete `apps/legacy`, `infra/nginx/legacy`, the interim routes and the live-routes map.
- ADRs for the decisions in this plan (`docs/adr/`), including the design direction and motion rules.
- `docs/new-app.md`: how `apps/admin` starts from `apps/app` (shares `ui`, `blocks`, `i18n`, `api`,
  `auth`, the design doc and motion tokens; own role guard, own subdomain).
- Backlog: httpOnly cookie auth if not done (B5), passkeys, dark theme toggle, CSP enforce on the app,
  error monitoring (Sentry or similar) with web-vitals, TypeScript 7 when typescript-eslint supports it.

---

## Risks

| #   | Risk                                                                 | Mitigation                                                                                                                  |
| --- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| R10 | Backend response shapes differ from what legacy assumed (no OpenAPI) | Fixtures captured from staging; each Zod schema tested against them; parse failures reported, not crashing                  |
| R11 | Money flows (unlock, checkout) regress                               | Ported tests, Razorpay test-mode purchase in every billing release, unlock confirm shows cost and balance after             |
| R12 | Users bounce between old and new screens during the rollout          | Same session keys; slices grouped by area so a task never crosses apps; shell ships first and looks the same on every slice |
| R13 | Camera, uploads or polling behave differently on real devices        | UAT on Android Chrome + iOS Safari + Windows Chrome per slice; upload fallback for denied camera                            |
| R14 | No staging or test accounts (B1)                                     | Blocks UAT and the billing slice. Work up to 5.6 can proceed without it                                                     |
| R15 | Translation quality in the app                                       | Native review before a locale is switched on; until then the app falls back to English entirely                             |
| R16 | The redesign grows the scope ("one more polish pass")                | Patterns fixed at 🔵 5 and 🔵 7; later slices reuse them; polish beyond the checklist goes to a backlog                     |
| R17 | Motion hurts performance or accessibility                            | Lazy features, transform/opacity only, INP budget, reduced motion honoured and tested, visual tests run without motion      |
| R18 | Existing users dislike the change                                    | Same words for the same things, same URLs, a short "what's new" note per area on release, feedback link in the user menu    |

---

## What I need from you (and when)

| Need                                                 | By step  |
| ---------------------------------------------------- | -------- |
| Approve this plan                                    | 5.0      |
| 🔵 4: design direction; D11 colour                   | 5.0      |
| B1: staging API, Razorpay test keys, 4 test accounts | 5.7      |
| B2: OpenAPI schema, if the backend can expose one    | 5.2      |
| D9: data-table dependency                            | 5.6      |
| 🔵 5: shell design; D6 incremental rollout           | 5.5      |
| D7: one sign-in page; D12: UX metrics events         | 6.2      |
| D8: setup checklist instead of the modal tour        | 6.3      |
| B3: Conversions API                                  | 6.2, 6.8 |
| B6: attention counts, job drafts (optional)          | 6.3, 6.5 |
| B7: applicant status, jobs list filters              | 6.5      |
| Native translation review per locale                 | 6.13     |
| B4 (+ B5): CORS and refresh cookie for the subdomain | 7.1      |
