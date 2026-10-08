# 0011 · `@tanstack/react-table` for every table

Accepted.

## Context

Jobs, applicants, candidate pool, unlocked candidates, invoices, team and shared links all need
sorting, selection, column choice and paging, and each legacy table did it differently.

## Decision

One `DataTable` in `apps/app/app/components/data-table.tsx` on `@tanstack/react-table` v9 (shadcn's
data-table pattern): URL-backed sort and page, row selection with bulk actions, compact rows,
keyboard row navigation, and a card list below `md`.

## Consequences

- Every list behaves the same and keeps its state in the URL.
- Wide tables scroll inside their own container; the shell's `min-w-0` keeps them from widening the
  page.
