# App design standard

The checklist every app screen is reviewed against, from the UX brief to the release. The patterns
are in the design lab (`pnpm --filter app dev`, then `http://localhost:5175/_lab`).

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
  step, score bars once on first view, field error shake, route crossfade (View Transitions).
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
