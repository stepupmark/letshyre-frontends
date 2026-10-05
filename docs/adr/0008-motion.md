# 0008 · Motion only where it explains a change

Accepted at gate 4.

## Context

Legacy used `framer-motion` for decoration. Motion costs bundle size and input latency, and some
people need it off.

## Decision

- `motion`, imported only as `m` from `motion/react-m` inside `LazyMotion` with async features. Lint
  blocks `framer-motion` and the non-lazy `motion` component.
- `MotionConfig reducedMotion="user"` at the root. Tokens in `apps/app/app/lib/motion.ts`: 120, 200
  and 320 ms, ease-out `[0.2, 0, 0, 1]`, nothing in a work flow over 400 ms.
- Animate `transform` and `opacity` only. No loops except live progress, no stagger on tables after
  first load, nothing blocks input. Route changes use View Transitions.
- Each use answers "what changed?": list rows added or removed, undo, wizard direction, credits
  moving, upload progress, scorecard bars filling once.

## Consequences

- Nothing is clickable only after motion loads; without it, elements simply appear.
- Motion moments are reviewed with the copy in each slice.
