# Marketing pages that may be retired

These pages were taken out of the site header on 2026-10-31. They are still built, prerendered and
reachable by URL, and may be removed later.

| Page           | Path          | Route                               | Copy namespace |
| -------------- | ------------- | ----------------------------------- | -------------- |
| For employers  | `/employers`  | `routes/_site.$lang.employers.tsx`  | `employers`    |
| For candidates | `/candidates` | `routes/_site.$lang.candidates.tsx` | `candidates`   |

All paths are under `apps/marketing/app`, and pages sit behind the locale prefix (`/en/employers/`).

## Removing them

- Delete the route files and their entries in `lib/pages.ts`.
- Delete the `employers` and `candidates` locale files in all 19 locales, and `nav.employers` /
  `nav.candidates` in the common namespace if nothing else uses them.
- Search for other links to the paths (footer, product menu, CTAs, the assistant's prompts) and
  remove or redirect them.
- Remove them from the sitemap and add redirects to a live page so indexed URLs don't 404.
- Run `pnpm knip` for components only those pages used.
