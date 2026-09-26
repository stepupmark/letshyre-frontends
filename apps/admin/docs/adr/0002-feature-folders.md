# 0002: Feature folders with a public index

Status: accepted

## Context

Code used to be split by type (`api/`, `hooks/`, `pages/`, `types/`), so one change touched five folders and nothing showed which pieces belonged together.

## Decision

Each area of the admin lives in `app/features/<name>` with `services`, `schemas`, `queries`, `mutations` and `components`. Routes and other features import only from the feature's `index.ts`. Shared building blocks live in `app/components` and `app/lib`.

## Consequences

- A feature can be read, changed or deleted as one folder.
- The index is the contract; knip flags anything exported but unused.
- Shared code has to be genuinely shared. Something used by one feature stays in that feature.
