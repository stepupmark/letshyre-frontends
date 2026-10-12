# 0009 · One sign-in page for both roles

Superseded by [0017](./0017-auth-screens.md).

## Context

Legacy had `/employer/sign-in` and `/employee/sign-in`. People picked the wrong one and got an
error, although the API returns the role on sign-in either way.

## Decision

`/sign-in` serves both roles and sends each person to their own dashboard. The old per-role URLs
redirect to it, so bookmarks and emailed links keep working. Registration stays per role, reached
from `/get-started`.

## Consequences

- Guards send signed-out visitors to `/sign-in` with a return path.
- The old sign-in URLs must keep redirecting for as long as links to them may exist.
