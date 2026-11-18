# Blog feature audit and implementation plan

16 November 2026. Covers `apps/marketing`: `app/lib/blog`, `app/features/blog`, the blog routes,
`app/lib/seo/*blog*`, `scripts/blog-*.ts`, the blog parts of `postbuild.ts` and `readiness.ts`, and
`.github/workflows/blog.yml`.

## Status

Implemented 16 November 2026, uncommitted. No lint, typecheck, build or test was run, at the
owner's request; run the checks at the end before merging. Three things still need someone:

- **Deploy hook.** The `MARKETING_DEPLOY_HOOK` secret, from whoever runs hosting. Until it's set,
  the scheduled workflow only warns.
- **Read-aloud on real voices.** Check it on Chrome desktop with a Google voice at 0.75×, and on
  Android.
- **Blog copy in 19 locales.** This is recorded as an open question in ADR 0021, not decided.

Decided while implementing:

- The CTA audience is kept in `sessionStorage`, not consent-gated. The consent cookie only
  covers analytics.
- `blog:check` hides suggestions on a full run unless `--suggest`, a named post or `--ci` is
  given.

Correction to the findings below: the post page has two scroll handlers that read layout on
every event, the active-section tracker and the contents bar, not five. Reading progress is CSS
and back-to-top is an IntersectionObserver.

## Where it stands

The foundation is sound. Prerendered MDX with a closed component set, Zod at every edge, one chunk
per post, a remark guard, and build checks for links, titles, hreflang and budgets. That is more
discipline than most blogs this size have. The 48 blog unit tests pass, and `blog:check` reports 0
errors across 36 posts.

The problems sit at the edges: publishing timing, browser storage, the read-aloud player, and two
build-time readers that agree only by convention. None of them is visible in today's content, which
is why they're worth fixing before the blog grows.

Severity: **P1** can lose a post or a reader's data in normal use. **P2** is a real bug in an edge
case or a risk that grows with content. **P3** is hygiene.

## Findings

### P1. Scheduled and late-night posts can silently not go live

- `scripts/blog-publish.ts:33` dates a post by the writer's local calendar day
  (`toLocaleDateString("en-CA")`). `isLive` (`app/lib/blog/list.ts:34-38`) compares with the UTC
  date. A post published in India between 00:00 and 05:30 is dated a day ahead of UTC, so the build
  triggered by its merge holds it back as scheduled.
- Nothing rebuilds daily. There is no scheduled workflow in `.github/workflows/` (only `ci.yml` and
  `blog.yml`), and `docs/launch-checklist.md:31` still lists it as open. A held-back or `--on`
  post appears only when someone happens to deploy again.

**Failure:** the writer publishes at 01:00 IST, merges, and the post isn't on the site. Nothing
tells them why.

### P1. Saved posts are wiped at 201

`app/features/blog/lib/reader.ts:116` caps the stored list at 200 with `z.array(...).max(200)`, but
`toggle` (`:127-131`) never trims before writing. Saving the 201st post writes 201 slugs. The next
read fails the schema, `localStore` falls back to `[]`, and every saved post is gone.

### P2. Read-aloud can stall on Chrome's online voices

`app/features/blog/lib/listen-text.ts:214-215` notes that Chrome's online voices stop about 15
seconds into an utterance, then allows 300 characters. At rate 1 that is roughly 18 to 22 seconds of
speech. When Chrome cuts an utterance, `onend` often doesn't fire, so `speakAt` never moves on and
the player shows "playing" in silence. Rate 0.75 makes it worse. _Confirm on Chrome desktop with a
Google voice before fixing._

### P2. A bad post link on the client shows the error screen, not a 404

`app/routes/_site.$lang.blogs.$slug.tsx:17-20` runs `serverLoader()` and `loadPostBody()` in
`Promise.all`. For an unknown slug, `loadBody` rejects at once with `Nothing at …`
(`lib/post-modules.ts:23`). That rejection wins, so the route throws a plain `Error` instead of the
404 `serverLoader` would have thrown. The glossary route (`blogs.glossary.($term).tsx:21-24`) has
the same shape. Postbuild stops broken links inside the site, but a mistyped link from outside,
followed by client navigation, gets the generic error page.

### P2. Checklist ticks move to the wrong item after an edit

`components/mdx/checklist.tsx` stores ticks as item indexes under `pathname:title` (`:46`, `:133`).
Insert an item in a published checklist and every saved tick shifts down one. Remove one and the
counter reads "5 of 4" (`:81`, which counts stored indexes, not visible items).

### P2. Same-day posts are ordered by file name

`publishedPosts` (`list.ts:52-58`) sorts on the date alone. Five posts share 2026-11-16, so the
index, the feed and "newer / older" order them alphabetically by slug. The writer can't choose the
lead, and the order changes when a slug is renamed.

### P2. Two build-time readers agree only by convention

The prerender list and postbuild read posts with Node (`readiness.ts`). The loaders read them
through `import.meta.glob` (`posts.server.ts`). Each decides on its own:

- whether previews are on (`loadEnv("production")` plus `NODE_ENV` in `react-router.config.ts:7,16`,
  `import.meta.env.DEV` in `posts.server.ts:55`)
- what "today" is (`new Date()` in each process)
- which glossary terms ship (`postLangs` in `posts.server.ts:60-63`, catalog readiness in
  `readiness.ts:53-55`)

They agree today. But a build that crosses UTC midnight, or a build run with `--mode staging`, would
prerender one set of pages while the index links another. Postbuild would then fail with link
errors that point nowhere near the cause. No test holds the two readers together.

### P2. HTML budget headroom is shrinking

The largest post (`notice-period-job-hunt`) is 49.8 kB gzip against the 60 kB per-page cap, which
is 83% of it. Most posts are 42 to 48 kB. Every blog page also carries the whole `blog` namespace
in its loader data (11.6 kB raw). That includes the 4.3 kB `mdx` block, mostly calculator copy that
only posts with a `<Tool>` use. One long post with a few figures will break the build.

### P2. The search index may be served stale after a deploy

`lib/search-index.ts:30` fetches `/<lang>/blogs/search.json` with no version in the URL. If the host
or CDN caches JSON, readers get an old index after a deploy, with links to renamed or removed posts.
No hosting config is in the repo, so this is unconfirmed. Check the host's headers.

### P3. Smaller bugs

- **Offline search refetches on every keystroke.** A failed index load is deleted from the cache
  (`search-index.ts:35-38`), so each re-render starts a new fetch and flashes "Searching…".
- **Read-aloud reads collapsed FAQ answers.** `listenBlocks` doesn't skip closed `<details>`
  (`listen-text.ts:212`). It highlights hidden text, and `follow` scrolls towards it.
- **CTA personalisation storage has no consent gate.** The reader's audience is stored to
  personalise calls to action (`reader.ts:151`, `post-cta.tsx:17`). That is storage that isn't
  strictly necessary. Decide with whoever owns consent whether it needs the consent gate or should be
  session-only.
- **Scroll handlers read layout on every event.** The contents bar (`post-toc.tsx:17-21`) and
  active-section tracking (`hooks/use-active-section.ts`) each read layout on every scroll event,
  with no `requestAnimationFrame`.

### P3. Process and docs

- **`blog:check` noise.** It prints 137 suggestions, mostly "also tagged X, link it", which bury the
  two real warnings. Cap them at the two strongest per post, or put them behind `--suggest`.
- **Blog chrome in 19 locales for posts in one.** Posts are English only, so the blog ships only in
  `en`, yet the root rule makes every chrome change land in 19 locales. This is a policy decision:
  keep paying that cost, or amend ADR 0021 so the `blog` namespace is English-only until a locale
  has a post.
- **ADR drift.** ADR 0021 says each index page carries every post's title and description for
  search. Search now lazily fetches `search.json`. The ADR also doesn't mention guides, series,
  tags, the glossary, saved posts or read-aloud.
- **Test gaps** around what matters most: `postData` (neighbours, series, related exclusion), the
  saved-list cap, checklist keying, the client 404 path, reader parity, and the read-aloud chunk
  length.

## Implementation plan

Five phases, each one PR in `marketing` scope. Phases 1 and 2 are independent. Phase 3 depends on
nothing but is the largest. Phases 4 and 5 can go in any order after 1.

### Phase 1: publishing you can trust (P1)

1. **Pin dates to UTC.** Change `blog-publish.ts` to date posts by UTC
   (`new Date().toISOString().slice(0, 10)`). When the writer's local date differs, print one line
   saying when the post goes live.
2. **Rebuild daily.** Add `.github/workflows/scheduled-build.yml`, which runs on a cron at 00:30 UTC
   and calls the production deploy hook. The hook URL is a repository secret; the workflow has no
   other permissions. Tick the item in `docs/launch-checklist.md`.
3. **Show what's waiting.** Have `blog:status` list scheduled posts with the date each goes live,
   so a held-back post is visible.

**Done when** a post published at 01:00 IST appears on the next build, and a post dated `--on`
tomorrow appears within a day without anyone deploying.

**Tests:** extend `post.test.ts` around `isLive` with the IST-midnight case.

### Phase 2: browser-side data safety (P1, P2)

1. **Saved list.** `savedPosts().toggle` keeps the newest 200 (`[slug, ...saved].slice(0, 200)`).
   Make the schema forgiving on read: parse an array of strings, then slice to 200, so data already
   over the cap is trimmed instead of discarded.
2. **Checklist keys.** Key ticks by a short hash of each item's text (stable across reordering),
   stored as `string[]`. Read the old index format once, map indexes to the current items, and write
   the new format back. Count only ticks that match a visible item.
3. **Offline search.** Keep the failed promise in `loads` until Retry clears it explicitly, so typing
   doesn't refetch.
4. **Consent.** Once the owner decides, gate `readerAudience` writes on the consent package, or move
   it to `sessionStorage`.

**Tests:** a `reader.test.ts` covering the 201st save and an over-cap stored list, and a checklist
test covering an item inserted after ticking. Both are data-loss guards, which the testing rules ask
for.

### Phase 3: one blog model for both readers (P2)

1. **One pure model.** Add `app/lib/blog/model.ts` exporting
   `blogModel({ postFiles, termFiles, guideFiles, seriesFiles, previews, readyLocales, today })`.
   It returns `{ posts, terms, guides, series, routes }`, using the parsers that already exist. No
   `fs`, no `import.meta`.
2. **Both readers call it.** `readiness.ts` passes files read with `fs`; `posts.server.ts` passes the
   globbed files. Delete the duplicated filtering in each.
3. **One date and one previews flag.**
   - `react-router.config.ts` sets `process.env.BLOG_BUILD_DATE` once, if it's unset, at the start
     of the build. Both readers and postbuild read it.
   - `previewsOn` takes the resolved `VITE_ENV` only. Dev passes `"development"` explicitly. Drop
     the separate `NODE_ENV` and `import.meta.env.DEV` paths.
4. **A parity test.** Build the model from `content/` through both input shapes and assert the same
   routes. Add a postbuild check that every prerendered blog path is in `routes` and the reverse,
   reported as "reader mismatch", not as broken links.
5. **Same-day order.** Accept an optional time in `publishedAt` (`2026-11-16T09:00`). Sort on the
   full string, compare `isLive` on `publishedAt.slice(0, 10)`, and write the date part to the
   sitemap, feed and schema. `blog-publish` writes the current UTC time, so posts published the same
   day keep the order they were published in.

**Done when** `readiness.ts` and `posts.server.ts` are each under 40 lines of wiring, and the parity
test fails if either reader changes alone.

### Phase 4: runtime correctness (P2, P3)

1. **Client 404.** In both clientLoaders, await `serverLoader()` first (it throws the 404), then load
   the body. Or have `loadBody` return `false` for an unknown key and throw
   `data(null, { status: 404 })`. Add an e2e step: open the index, navigate client-side to
   `/en/blogs/not-a-post`, and expect the 404 page.
2. **Read-aloud length.**
   - Lower `MAX_CHUNK` to 180 characters and split long sentences at commas.
   - Add a watchdog: if `onend` hasn't fired within `chars / 8 / rate + 3` seconds, move to the next
     block.
   - Check on Chrome desktop with a Google voice at 0.75×, and on Android.
3. **Read-aloud skips collapsed answers.** Skip text inside `details:not([open])`, except its
   `summary`.
4. **One scroll source.** Add `useScrollFrame()` in `app/hooks`, a single passive listener batched to
   `requestAnimationFrame` and shared through `useSyncExternalStore`. Move the five scroll consumers
   onto it.
5. **Search index versioning.** Append the build id to the `search.json` URL, or confirm the host
   sends `Cache-Control: no-cache` for JSON. Record which in ADR 0021.

### Phase 5: budget, tooling and docs (P2, P3)

1. **Calculator copy.** Split the `mdx.tools` copy into a `blogTools` namespace. Load it only for
   posts whose parse finds a `<Tool>`: add `tools: boolean` to `Post`, the same way `promoted` is
   detected, and add the namespace in `postData`. Apply it to all 19 locales with `pnpm i18n:apply`.
2. **Budget early warning.** Have postbuild warn at 85% of the per-page HTML budget and name the
   page, so a long post is caught at review, not at the cap.
3. **`blog:check` signal.** Show at most two link suggestions per post, ranked by shared tags, with
   `--suggest` for the full list.
4. **Locales.** Record the chrome-locale decision from the findings as an ADR 0021 amendment.
5. **ADR 0021.** Bring it up to date: lazy `search.json` search, guides, series, tags with three or
   more posts, the glossary, saved posts and read-aloud (all browser-only), the UTC and daily-build
   rule, and the shared blog model.

## Out of scope

Author pages, full-text search, a CMS and server components, which ADR 0021 already defers. The post
copy itself is out of scope too: the five product posts were checked against the product copy in
this branch.

## Checks per phase

Run only what each change touches:

```bash
pnpm --filter marketing exec vitest run app/lib/blog app/features/blog
pnpm --filter marketing blog:check
pnpm --filter marketing build
pnpm --filter marketing exec playwright test e2e/blog.spec.ts --project=chromium
```

Phase 3 also needs `pnpm knip` and `pnpm --filter marketing typecheck`. Phase 5 needs
`pnpm i18n:apply`.
