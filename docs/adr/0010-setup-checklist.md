# 0010 · Setup checklist and tips instead of a modal tour

Accepted in step 6.3 (D8).

## Context

Legacy ran a `react-joyride` modal tour on first sign-in. It blocked the screen, was skipped by most
people and couldn't be found again.

## Decision

A "Finish setting up" checklist on the employer dashboard (account, company, first job, team) that
ticks itself off from real data and can be hidden. One-time contextual tips on shadcn `Popover`,
remembered per browser and resettable from the user menu.

## Consequences

- No tour dependency, nothing modal on first load.
- The checklist reads existing endpoints; dedicated counts (B6) would make it one request.
