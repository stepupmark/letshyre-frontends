# 0017 · Auth screens: role pages, one typeface, drawn illustrations

Accepted 2026-10-12. Supersedes [0009](./0009-one-sign-in.md).

## Context

0009 merged sign-in into one page. The redesign brought back `/employer/sign-in` and
`/employee/sign-in` so each side gets its own copy and art, with `/sign-in` kept as a role chooser.
The auth screens also loaded two extra fonts (Instrument Serif and the Ms Madi script) that only
covered Latin, and leaned on tilted cards and handwritten notes.

## Decision

- `/` (and `/get-started`) is the role choice for new accounts, `/sign-in` the role choice for
  sign-in, and each role has its own sign-in and register page.
- Auth screens use Outfit only. Headings are semibold at 28 to 32px with tight line height; body copy
  stays at 16px.
- From `lg` up the illustration sits on the left and the form on the right. Below `lg` there is no
  art, only the form.
- Illustrations are inline SVG built from design tokens (`features/auth/components/art`), so they
  follow the theme and need no image files. Text in them is sketched, never translated copy.
  Register and password reset draw from the flow's own state, so the art fills in as steps are done.
- Motion is CSS only (`settle`, `pop`, `draw`, `grow-*`, `float` in `app.css`) and turned off under
  `prefers-reduced-motion`.
- Every page outside the dashboard has the language picker in its header, listing the shipped
  locales. All 19 ship; the catalog loader map is split per locale so the initial bundle stays
  within budget.

## Consequences

- Guards still send signed-out visitors to `/sign-in`, which now asks for the role first.
- New illustrations should reuse the primitives in `art/svg.tsx` rather than adding image assets.
- The marketing site still loads Instrument Serif for its own pages.
