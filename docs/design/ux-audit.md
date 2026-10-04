# UX audit of the legacy app (step 5.0)

> Written 2026-10-04 from the legacy source (`apps/legacy/app`) and its English copy. The timed
> walk-through with real accounts on desktop and a phone needs staging (B1); the targets in
> [app-implementation-plan.md §2.6](../app-implementation-plan.md) get their baselines then.

The six key tasks, what a user meets today, and what the new app does instead.

## 1. Employer sign-up

**Today:** `/employer/register` runs six screens: email → email OTP → mobile → mobile OTP →
password → success (`SharedRegisterFlow`). Employers and candidates have separate sign-in pages.

| Problem                                                                                             | Fix in the new app                                     |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Wizard state lives in `useState` (`AuthWizard`), so a refresh or a slip of the back button restarts | Step and entered data survive refresh and back (6.2)   |
| Two sign-in pages; users pick the wrong one                                                         | One `/sign-in` (D7)                                    |
| After sign-up the dashboard shows zeros with no next step                                           | Setup checklist (prototype: dashboard → "New account") |

## 2. Post a job

**Today:** `/employer/post-job` asks for a job title _and_ a JD file before it parses anything. The
parsed result opens in a popup form (`JdFormPopup`), then a success popup.

| Problem                                                                                                           | Fix                                               |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Missing title or file is reported by toast (7 toasts in `PostJob.jsx`), not next to the field                     | Inline errors and an error summary                |
| A long form inside a modal, on top of the page; nothing is saved if it closes                                     | A full page with an autosaved draft (6.5)         |
| AI-filled fields look the same as typed ones, so nothing tells the employer what to check                         | "From your JD" marker until the field is reviewed |
| **Editing a job is a dead end:** `PostJob({ editJobId })` shows the toast "Edit Job not yet migrated to new hook" | Edit works (6.5)                                  |
| Industry list falls back to a hard-coded English list when the request fails                                      | Error state with retry; no silent fallback        |

## 3. Review applicants

**Today:** `/employer/view-jobs/:jobId/applicants` lists name, applied date and status.

| Problem                                                                                    | Fix (prototype: Applicants)                        |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| **Rows do nothing** (`cursor-default`, no click handler): no way to open an applicant here | Row opens a peek panel; `j`/`k` move through it    |
| No match score in the list, so every applicant looks the same                              | Match band and "4 of 5 skills" per row, best first |
| No shortlist or reject from the list                                                       | Row menu and bulk actions, with Undo               |
| Page number is component state, lost on refresh or back                                    | Tab, search, page and open candidate in the URL    |
| Hover lifts every row (`hover:-translate-y-0.5`) with a blue shadow                        | Plain row highlight                                |

## 4. Unlock a candidate

**Today:** `/employer/candidate-pool` makes the employer pick a job, then shows AI-matched rows with
score rings. "Unlock" opens a modal with the cost and optional extra interviews (1 credit each).

| Problem                                                                              | Fix (prototype: peek panel → Unlock)                                    |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| The modal shows the cost but **not the balance or the balance after**                | Confirm says "You'll have 4 credits left"; the topbar counts down       |
| No insufficient-credit path: the API error message is shown in a toast               | Button disabled with the balance and an "Add credits" link that returns |
| Scores shown as exact numbers in rings (`87`) suggest more precision than the AI has | Bands with reasons ("Why this match")                                   |
| After unlocking, only a toast; the employer has to find the candidate again          | Details resolve in place, "Open scorecard" right there                  |

## 5. Buy credits

**Today:** dashboard → "Add Credits" → `/employer/billing`. The dashboard credit card is a decorative
dual ring with hard-coded hex colours and its own `system-ui` font for the percentage.

| Problem                                                                | Fix                                                         |
| ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| Shows "% used" but the employer decides on "how many unlocks can I do" | Balance in credits and in unlocks (prototype: Credits card) |
| No low-balance warning anywhere                                        | "Low" badge and an attention item                           |
| After paying, the balance elsewhere doesn't update until a reload      | Balance updates in place, animated (6.8)                    |

## 6. Candidate onboarding

**Today:** `EmployeeOnboarding` steps: identity → photo → resume → job preferences (industry,
locations, company details, mandatory and optional documents) → review. The draft persists in
Zustand without files. Review-step errors are toasts.

| Problem                                                             | Fix (6.10)                                     |
| ------------------------------------------------------------------- | ---------------------------------------------- |
| "Job preferences" hides five sub-steps behind one step in the count | Honest step count with a time estimate         |
| Files are lost on refresh with no warning                           | Say so before leaving; re-upload is one tap    |
| Resume AI results are shown as a finished profile                   | "We found these, check them" with inline edits |

## Across the app

- **Fake data on the dashboard.** The three stat cards draw bar charts from constants
  (`bars={[12, 18, 14, 28]}`) labelled with hard-coded English months ("Dec Jan Feb Mar"), the same
  for every employer. They are removed; the dashboard leads with what needs attention.
- **"Welcome back!"** as the page title on every visit. The new title is the page name.
- **Decoration over content:** custom shadows, hover lifts, brand-blue glows on the active nav item,
  per-card colours. The new app uses borders, one card level and colour only for status.
- **Validation by toast** in several flows. Errors go next to the field.
- **Class-name constants** (`CP_FILTER`, `UP_MODAL`, …) make the markup hard to read and drift
  between screens. Classes are written inline (lint enforces it).
- **Breakpoints up to `4xl`** with separate sizes per breakpoint. The new layout uses a max content
  width instead.

## Kept from legacy

Logical properties for RTL, `tabular-nums` in the pool, filters in the URL on the candidate pool,
error states with retry (`useQueryFailure`), loading regions with `aria-busy`, reduced-motion
variants on hover effects. These carry over as rules.
