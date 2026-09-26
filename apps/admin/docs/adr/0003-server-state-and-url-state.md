# 0003: TanStack Query for data, the URL for filters

Status: accepted

## Context

Pages kept filters in component state, so a reload or a shared link lost them, and caches went stale after changes because each hook invalidated by hand.

## Decision

- All server data goes through TanStack Query, with a key factory and `queryOptions` per feature.
- Mutations declare `meta.successMessage`, `meta.errorMessage` and `meta.invalidates`; one `MutationCache` handles toasts and invalidation.
- Filters, search and paging are URL search params, parsed with nuqs. The same parsers are used by the `clientLoader`, so prefetching matches what the page will request.
- Responses are validated with zod in the service layer.

## Consequences

- Every list view is linkable and survives a reload.
- A backend shape change surfaces as a zod error in one service instead of `undefined` deep in a component.
- There is no global client state store; so far nothing has needed one.
