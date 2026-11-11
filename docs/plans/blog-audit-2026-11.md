# Blog audit: November 2026

This audit covers the blog on `feat/marketing-blog` at `f94f49c5`. It reviewed about 7,400 lines:
`app/features/blog` (75 files), `app/lib/blog`, the blog parts of `app/lib/seo`, `page-data.server.ts`,
`messages.server.ts`, `readiness.ts`, the blog scripts and `postbuild.ts`, `e2e/blog.spec.ts`, and
the content (12 published posts, 10 glossary entries, 3 topic guides). The same rules apply as for
the marketing audit:

- write only the tests that guard something important
- remove redundant tests
- run only the tests a change affects
- keep comments short

## Status

Done in `84b61384` (phase 0), `66564616` (phase 3), `7a292d1d` (phase 1), `c7432a2f` (phase 2
and the registry test) and `7aff67b5` (phase 5).

Still open:

- **1.4, a daily scheduled deploy.** This waits on ops.
- **Phase 3, a named author.** It needs a real person's name, role and profile link.

## Overall picture

The foundations are good:

- The MDX guard fails the build on anything a post shouldn't contain.
- Frontmatter goes through Zod, and every page is prerendered with its full text.
- The JS budget, CSP and SEO checks run on every build.
- Rarely used code is lazy-loaded.
- The writing itself is clean. A scan found no em dashes and no AI phrasing; the only flagged word was
  "unlock", which is a product term.

The problems fall into four groups:

1. **Bugs.** Two are confirmed in a browser: dates are off by a day for visitors west of UTC, and
   the post's action row shifts the article after hydration. Code review found two more, and there
   is a latent build break waiting for the first translated glossary entry.
2. **Duplication.** The list of blog URLs and the locales each one ships in is worked out in four
   places. The build break above is that drift.
3. **Payload.** Loaders send whole posts to the browser where a card needs a summary, about 4× the
   data.
4. **Features ahead of content.** Twelve posts produce 27 listing URLs. Series and authors are
   built and used by no post. No post has its own share image.

## Phase 0: Bugs (about half a day)

| #   | Issue                                                                                                                                                                                                                                                                                                                                                                                                                      | Fix                                                                                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0.1 | **Dates are a day early west of UTC.** `components/post-facts.tsx:19,32,37` formats `"2026-11-09"` in the visitor's time zone. Checked with Playwright: in `America/New_York` the post header reads "Published November 8, 2026". This affects every post header and card, and the prerendered HTML disagrees with the hydrated page.                                                                                      | Pass `timeZone: "UTC"` to both date styles, as `archive-page.tsx` already does. Put the options in one `postDate` helper so the next date doesn't forget it. |
| 0.2 | **Listen keeps reading the previous post.** `post-page.tsx:106`: the post route stays mounted when you click through to another post, so `ListenButton` keeps its state and the speech queue. Its cleanup (`listen-button.tsx:53`) only runs on unmount. Found by reading the code; it wasn't reproduced, because headless Chromium has no voices.                                                                         | `<ListenButton key={post.slug} …>` so a new post unmounts the old player and cancels speech.                                                                 |
| 0.3 | **The action row shifts the article.** `post-page.tsx:103`: Listen and Save both render nothing until hydration, then the row grows to 36 px and pushes the article down. Measured CLS was 0.005 at 1280×900, on every post.                                                                                                                                                                                               | Give the row `min-h-9`, or render Save disabled before hydration so the row has its height in the HTML.                                                      |
| 0.4 | **The notice calculator defaults to yesterday in India before 5:30 am.** `mdx/tools/notice-buyout.tsx:8` takes "today" from `toISOString()`, which is UTC. Separately, a join date typed before the resignation date makes `unserved` larger than the notice period (`lib/tools.ts:40`).                                                                                                                                   | Use the local date (`new Date().toLocaleDateString("en-CA")`). Clamp with `Math.min(noticeDays, …)`.                                                         |
| 0.5 | **Latent build break.** `readiness.ts:66` keeps glossary entries for locales whose blog copy is complete, before `withBlogIndex` narrows those to locales with posts. `messages.server.ts:48` filters after it. All 18 other locales have the blog copy but no posts. So the first `content/glossary/<id>/hi.mdx` adds `/hi/blogs/glossary` to the prerender list, `glossaryData` returns 404 for it, and the build fails. | Filter terms with `withBlogIndex(pages, posts).get("blog")`. Phase 2.1 removes the cause.                                                                    |

## Phase 1: SEO and content (about half a day, plus one decision)

**1.1 No post has its own share image.** None of the 12 posts has `og.jpg`, so every share card and
every `BlogPosting` uses `/og/default.jpg`. `pnpm blog:og` draws these images but has never been
run.

- Run `pnpm blog:og` and commit the 12 images.
- Make `blog:check` warn when a published post has no `og.jpg`, so this can't slip again.

**1.2 Too many thin listing pages.** Twelve posts produce 27 indexable listing URLs:

- 5 topic pages: interviewing and news have one post each
- 9 tag pages, with 2 to 4 posts each
- the archive and the index
- the glossary page and 10 term pages

A tag page with two posts mostly repeats a topic page.

- Ship a tag page only when it has at least 3 posts (`MIN_TAG_POSTS` in `list.ts`, used by
  `tagsOf`). Show a post's tag chips only for tags that have a page.
- That keeps 6 of the 9 tags (ai, hiring-process, india, interviews, job-search, resumes) and drops
  career-growth, salary and skills until they grow.
- The thin-topic padding already in `topicData` covers the topic pages.

**1.3 Glossary lastmod ignores the glossary.** `postbuild.ts:192,199` dates the glossary and term
pages from `features/blog` and `content/blog`, so editing an entry never changes its sitemap date.
Use the git date of `content/glossary/<id>/<lang>.mdx`.

**1.4 Scheduled posts wait for an unrelated deploy.** The README says a post goes live "with the
first build on or after" its date, and nothing in `.github/workflows` builds on a schedule. A daily
scheduled deploy fixes it. This is blocked on ops, the same as the marketing audit's phase 5.

**1.5 FAQ schema, no change.** Google only shows FAQ rich results for government and health sites.
The `FAQPage` data still helps answer engines, so keep it. Just don't add `<Faq>` to a post for
search ranking.

## Phase 2: Architecture (about 2 days)

**2.1 One registry for blog routes.** Four places each list the blog's URLs and the locales they
ship in:

- `readiness.ts:128` `readyPaths`, for prerendering
- `postbuild.ts:146` for the sitemap
- `postbuild.ts:273` for the page checks
- the `*Locales` helpers in `messages.server.ts:59-88`, for hreflang

Adding the glossary meant editing all four, and 0.5 is where they drifted apart.

- Add one pure `blogRoutes({ posts, terms, blogLocales })` in `lib/blog/routes.ts` that returns
  `{ path, lang, locales, lastmod }[]`.
- Prerendering, the sitemap, the postbuild checks and each loader's `locales` all read from it.
- Its test replaces the `readiness` block in `post.test.ts` rather than adding to it.

**2.2 The preview flag is worked out in three places.** `react-router.config.ts:6`,
`postbuild.ts:119` and `posts.server.ts:31` each decide whether drafts show. Use one
`previewsFor(env)` helper. Keep both loaders (the Vite glob for HMR, `fs` for Node); they already
share the parsers.

**2.3 Blog queries live in the catalog loader.** `messages.server.ts` loads i18n catalogs and also
answers `postsIn`, `termsIn`, `guideFor` and the rest. Move those queries to
`lib/blog/content.server.ts`. This is a mechanical move.

**2.4 Loaders send whole posts.** The `posts` and `others` of `topicData` (`page-data.server.ts:93-97`)
and the `newer`, `older` and `related` of `postData` (`:123-130`) are full `Post` objects, with
headings, sources, FAQ and terms. That data goes to the browser twice, inline in the HTML and in
the `.data` file. Measured on the careers topic, it's 7.1 kB of JSON where summaries would be
1.8 kB.

- Map them through `summarize`.
- Work out `readersOf` in the loader instead of in `topic-page.tsx:18`, so `TopicPage`,
  `RelatedPosts` and `PostNeighbours` can take `PostSummary`.

**2.5 Meta functions cast loader data.** Seven meta functions read their data with `as` instead of
a checked type:

- `blog-pages-meta.ts:30,70,91,125`
- `post-meta.ts:15`
- `topic-meta.ts:12`
- `blog-meta.ts:19`

If a loader's shape changes, the code still compiles and the meta breaks without a warning. Have
the meta builders take typed data, and call them from each route as
`meta = ({ loaderData }: Route.MetaArgs) => …`, so typegen checks the shape.

**2.6 Duplicated pieces.**

- `SLUG` and `FILE` are defined in both `post.ts:18,98` and `glossary.ts:9-10`. Export them once.
- The "Blog / …" eyebrow link is written out by hand in seven places: archive, tag, topic,
  glossary, term, post header and index page 2. Use one `BlogCrumbs` component.
- The arrow back-link appears three times: `post-page.tsx:143`, `glossary-page.tsx:56` and
  `term-page.tsx:80`. Make it one small component.

**2.7 Classes in a constant.** `post-share.tsx:9` has `const iconLink = buttonVariants(...)`, which
breaks the "classes stay inline" rule. Inline it on the three links.

## Phase 3: Features nobody uses yet (decide, then delete or keep)

| Feature                                                                                      | Use today                                 | Recommendation                                                                                                           |
| -------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Series: `series` frontmatter, `PostSeries`, series feeds, the feed link in meta, 3 keys × 19 | 0 posts                                   | Remove unless a series is planned this quarter; git keeps it. The feed loop in `postbuild.ts:221` goes with it.          |
| Archive page                                                                                 | 12 posts over 2 months                    | Remove until there are about 30 posts; the index already lists 10. It isn't live, so the URL contract costs nothing yet. |
| Authors: `AUTHORS = {}`, avatar and initials in `post-header.tsx`, schema author             | 0 authors                                 | Don't delete. Add at least one named author: advice posts gain trust from a real byline, and the code is ready.          |
| Footnote popovers                                                                            | Only in the `style-reference` draft       | Keep. It's an authoring feature with no initial JS.                                                                      |
| Reading-time filter                                                                          | 3 buckets for 12 posts, one of them empty | Keep; empty buckets are already hidden. Revisit if nobody uses it.                                                       |
| Listen, quote share, saved posts, resume reading                                             | Work as built                             | Keep. They're lazy-loaded or tiny. Fix 0.2.                                                                              |
| `featured` frontmatter                                                                       | 0 posts                                   | Keep. It's one line and a real editorial lever.                                                                          |
| `pnpm blog:translations`                                                                     | 0 translated posts                        | Keep. It's tooling with no runtime cost.                                                                                 |

The post page also carries a lot. Around the article there are:

- the TOC, the progress bar and back-to-top
- Listen and Save
- the series box
- the inline CTA and quote share
- sources, tags, share and "All posts"
- older/newer links, related posts and the CTA band
- the resume toast

The end of the article has five stacked blocks. Suggested trim: move the tag chips into the share
row, and drop the "All posts" link, which the eyebrow and the header already provide.

## Phase 4: Tests

There are three gaps, all covering logic that is easy to get wrong:

1. In `e2e/blog.spec.ts`, use `test.use({ timezoneId: "America/Los_Angeles" })` and check that a
   post's `<time>` text matches its `dateTime`. This guards 0.1.
2. A `blogRoutes` unit test, written with 2.1: a locale with glossary entries but no posts gets no
   glossary route. This guards 0.5 and replaces the `readiness` tests.
3. One more case in `lib/tools.test.ts`: a join date before the resignation date. This guards 0.4.

None of the existing tests is redundant. The `readiness` block in `post.test.ts` moves into
`blogRoutes`.

## Phase 5: Comments and small cleanups

- `lib/terms.ts:3` and `lib/post-body.ts:1`: the JSDoc restates the export name. Delete it.
- `seo/blog-schema.ts:6-7` stacks two comments. Keep the first.
- `quote-share.tsx:110` writes to the clipboard without a `catch`, so a refused copy is an unhandled
  rejection. Add a `catch` that shows the error toast.

## Suggested order

1. Phase 0 and its two tests, in one commit (half a day).
2. Phase 1.1 and 1.2: share images and the tag threshold (half a day).
3. Decide on Phase 3, then delete in one commit (2 hours).
4. Phase 2.4, 2.6 and 2.7: summaries and duplicates (half a day).
5. Phase 2.1 to 2.3: the route registry. Do it after the deletions, so there are fewer routes to
   move (1 day).
6. Phase 2.5: typed meta (half a day).
7. Phase 1.3 and Phase 5 alongside whichever commit touches those files.

## Checks run for this audit

- Read every file in scope.
- Ran Playwright against the production build in `Asia/Kolkata` and `America/New_York`: date text,
  layout shift and console errors.
- Measured the JSON size of full posts against summaries for the careers topic and a post page.
- Counted feature use across `content/` (series, tags, components, share images, frontmatter
  fields).
- Scanned the English post, glossary, guide and UI copy for AI writing tells.
