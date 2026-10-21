# 0018 · The marketing chat launcher may loop

Accepted 2026-10-21. A scoped exception to [0008](./0008-motion.md).

## Context

0008 allows no loops except live progress. The home page's chat launcher was a plain 40px icon that
visitors overlooked, and the assistant is how a visitor asks a question before signing up. A
launcher that looks alive gets noticed without a pop-up or a modal.

## Decision

- The launcher on the marketing home page is a speech bubble with eyes, 56px on phones and 64px
  from `sm`. It runs one 8s idle loop: a blink, a glance, a moment of typing dots and a 2px bob,
  with a ripple ring every 2.5s. All of it is CSS (`launcher-*` in
  `apps/marketing/app/styles/app.css`), animating `transform` and `opacity` only.
- The loop pauses on hover, on keyboard focus and while the chat is open. After the chat has been
  opened once in the tab, only the blink and the ripple remain. Under `prefers-reduced-motion`
  nothing moves.
- A greeting bubble appears once per tab, 4s after load, and goes on scroll, after 8s, on dismiss
  or when the chat opens.
- The exception covers this launcher only. Every other loop still falls under 0008.

## Consequences

- WCAG 2.2.2 asks for a way to pause motion that lasts over 5s; hover, focus, opening the chat and
  the reduced-motion setting are that way, and after first use only the blink and the ripple keep
  going.
- The launcher keeps its accessible name, so tests that find it by role and name are unaffected.
