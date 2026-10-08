# 0006 · `ky` + Zod-parsed responses, TanStack Query, RHF + Zod

Accepted 2026-10-03.

## Context

The API has no OpenAPI schema and its envelopes vary (`{ success, data }` on most calls, bare
bodies on some). Legacy read fields loosely with axios and broke quietly when shapes changed.

## Decision

- `@workspace/api`: a small `ky` client with typed methods, uploads and downloads, and error copy.
  Every response is parsed with a Zod schema at the edge; a parse failure is reported, not rendered.
- TanStack Query v5 with `queryOptions` factories per feature. Zustand only for real client state.
- Forms with React Hook Form and Zod 4 (`jitless`, so the CSP never sees `eval`).

## Consequences

- Schemas are hand-written from captured responses and checked against the e2e fixtures; replace
  them with generated ones if the backend ships OpenAPI.
- Components get typed, already-validated data and never touch the raw envelope.
