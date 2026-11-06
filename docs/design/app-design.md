# App design standard

The checklist every app screen is reviewed against, from the UX brief to the release. The patterns
are in the design lab (`pnpm --filter app dev`, then `http://localhost:5174/_lab`).

## Foundations

| Area      | Rule                                                                                                                                                                                                                                                                                |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme     | shadcn default (neutral), light only. Components in `packages/ui` come from the CLI and are never edited                                                                                                                                                                            |
| Colour    | Neutral tokens for everything. Status colours only: `success`, `warning`, `danger`, `info` (+ `-muted` backgrounds), added to `globals.css` next to the shadcn tokens. Palette classes (`bg-emerald-50`) are blocked by lint. Text pairs ≥ 4.5:1, checked by `status-badge.test.ts` |
| Type      | Outfit. `text-2xl` page title, `text-base` section, `text-sm` body and tables, `text-xs` meta. Sentence case. `tabular-nums` on every number that sits in a column or changes (Outfit has `tnum`, checked in the lab)                                                               |
| Layout    | Content `max-w-6xl` (`7xl` from `2xl`), forms `max-w-xl`, tables full width. Page header: `<h1>`, one line of context, actions at the end                                                                                                                                           |
| Surfaces  | Borders, not shadows. One card level. Default radius                                                                                                                                                                                                                                |
| Icons     | lucide, 16px in content. Icon-only buttons have `aria-label`                                                                                                                                                                                                                        |
| Direction | Logical properties only (`ms-*`, `pe-*`, `start-*`, `text-start`). Sheets open from the inline end. Arrows flip with `rtl:-scale-x-100`                                                                                                                                             |

## Building blocks so far

| Block                           | Where                                        | Use                                                  |
| ------------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| `StatusBadge`                   | `app/components/status-badge.tsx`            | Every status, band or count that needs attention     |
| `bandOf` / `toneOf`             | `app/lib/score-band.ts`                      | Match and interview scores → strong / partial / low  |
| `AnimatedNumber`                | `app/components/animated-number.tsx`         | Credits and any balance that changes after an action |
| `PageHeader`                    | `app/components/page-header.tsx`             | Top of every page                                    |
| `useDelayed`                    | `app/hooks/use-delayed.ts`                   | Skeletons appear after 300 ms                        |
| Motion tokens, `MotionProvider` | `app/lib/motion.ts`, `app/components/motion` | All animation                                        |

## Motion

- `m` from `motion/react-m` inside `LazyMotion`; lint blocks `framer-motion` and `motion`.
- Durations: `fast` 120 ms, `base` 200 ms, `slow` 320 ms. Ease `[0.2, 0, 0, 1]`. Layout: spring,
  no bounce. Nothing over 400 ms.
- Animate `transform` and `opacity` (a short blur on the unlock reveal is the one exception).
- Allowed moments: list add/remove/reorder, bulk bar in/out, balance change, unlock reveal, wizard
  step, score bars once on first view, field error shake, route crossfade (View Transitions),
  result count change, filter chips in/out, a new page of results (fade and 6px rise, 30 ms stagger
  on the first six), the loading bar over stale results, and an action's button turning into its
  done state (Apply → Applied), the active-stage underline sliding between stages, an
  application stepper filling once on first view, the interview band scale and history bars filling
  once on first view, a row's chevron nudging toward its target on hover or focus, table rows
  rising in on their first load, picked candidates' avatars popping into the compare bar, and a
  newly added team member's row tinting once so you can see where they landed, and the top-up
  selection sliding between packs while the price and "balance after" roll, a buy arrow nudging
  toward its target on hover or focus, the low-balance note settling in, a coupon discount line
  and the checkout total rolling as they change, and a job's status badge
  crossfading after a bulk change, a job's facts settling in once, and the applicant panel's fit
  bars filling as each candidate opens, and the dashboard's figures and balance counting up as they
  first arrive, the candidate dialog's sections settling in as it opens, its profile sliding toward
  the next or previous candidate, and the locked fields' bars clearing as a candidate is unlocked, a result's "Unlocked" badge
  popping in, and its "Viewed" note fading in once you've opened it, a merge field
  chip popping into the template editor, the field menu dropping in under the caret, the
  readiness checks crossfading to a tick, the save state turning to "All changes saved", the
  preview easing between desktop and phone widths, candidates rising into the send list and
  sliding out when removed, a re-pasted candidate's row tinting once, the add box shaking once
  when lines can't be read, the send summary filling in step by step (its preview crossfading to
  the chosen template and avatars popping into its stack), the reviewed email's subject
  crossfading between candidates, and the sent envelope lifting in as the count rolls up.
- Reduced motion: values jump, only fades remain (`MotionConfig reducedMotion="user"`).
- Cost: ~10 kB gzip with the first paint, the `domMax` features (~29 kB) load after it.

## Screen review checklist

Copy into the slice PR and tick each line.

**Task**

- [ ] The user's task and how we know it worked are written in the UX brief
- [ ] One primary action, visible without scrolling at 360px
- [ ] Nothing in the legacy parity list is lost

**States**

- [ ] Loading: skeleton in the shape of the content, after 300 ms
- [ ] Empty, first time: one sentence and one action
- [ ] Empty, filtered: says so and offers "Clear filters"
- [ ] Error: what failed, that nothing was lost, Retry
- [ ] Partial data, slow network, session expired mid-form (form state kept)

**Content**

- [ ] Sentence-case headings; no "Welcome back"; no emoji
- [ ] Error copy says what happened and what to do
- [ ] AI output shows its source and can be edited or checked before use
- [ ] Numbers in columns use `tabular-nums`; dates, numbers and money through `Intl`

**Interaction**

- [ ] Filters, tabs, page and open panels in the URL; back and refresh restore them
- [ ] Reversible actions use Undo; irreversible or paid actions confirm and show the cost
- [ ] Keyboard: everything reachable, focus visible and never under a sticky header; list shortcuts
      listed on the page
- [ ] Touch targets ≥ 44px on mobile

**Visual**

- [ ] 360, 768, 1280, 1920 px; 200% zoom
- [ ] German (long words) and Arabic (RTL) without overflow or wrong direction
- [ ] No palette colours, no nested cards, no shadows on content
- [ ] Motion only from the allowed list, checked with reduced motion on and off

**Checks**

- [ ] axe clean at 360 and 1280
- [ ] No console errors or warnings
- [ ] INP under 200 ms on the slowest interaction (DevTools, 4× CPU throttle)

## Don't

Gradients, glow, glass, sparkle icons for AI · stat-card grids with trend arrows · `rounded-2xl
shadow-xl` cards · centred hero empty states with illustrations · exact AI scores like "87.4%" ·
validation by toast · class-name constants · animation on every element.
