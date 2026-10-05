# 0003 · shadcn defaults, never edited

Accepted 2026-10-03, colour confirmed at gate 4.

## Context

Legacy had hand-made colours, fonts and one-off components that drifted between pages.

## Decision

- The shadcn default theme (Base UI components, Outfit font) as the CLI emits it. Components in
  `packages/ui` are never edited; `pnpm ui:drift` fails the build if one differs from the registry.
- No brand accent on `--primary`. Status colours are added as tokens (`success`, `warning`, `info`,
  `danger`) next to shadcn's, because lint blocks raw palette classes.
- Tailwind classes are written inline on elements. Light theme only for now; components stay
  dark-ready.

## Consequences

- Anything shadcn doesn't do is composed in `packages/blocks` or an app's `components/`, never by
  patching `ui`.
- Upgrading shadcn is a re-add, not a merge.
