# Blog writing workflow: November 2026

How a post gets from idea to live today, what slows writers down or lets mistakes through, and the
changes that fix it. This plan covers `scripts/blog-*.ts`, `content/blog/README.md`,
`docs/blog-style.md`, the blog PR template and `.github/workflows/blog.yml`.

## Status

Done in `b63be8b7` (phases 2 and 3) and `24885816` (phases 1, 4 and 5).

Two things turned up along the way:

- The extended filler check flagged "leveraged" in `resume-after-ai`, where the post mentions it as
  an example. The convention is now that a mentioned word goes in italics, and the post does that.
- Staging builds were failing on the `style-reference` draft's title width. It now has a shorter
  `metaTitle`.

The translation command under "Later" waits for a first translation.

## What works already

- `pnpm blog:new` asks for a title, reader and topic, and creates a draft with the section skeleton.
- The dev server reloads the post as you save, and the MDX guard fails on anything a post can't
  contain.
- `pnpm blog:check` reports errors, warnings and suggestions without a build:
  - frontmatter
  - heading order
  - internal links that 404
  - alt text
  - brand spelling
  - em dashes and filler words
  - long sentences
  - photo size
  - missing cover or share image
  - glossary words to wrap and tagged posts to link
- CI runs `blog:check --links --ci` on every PR that touches `content/blog` and annotates the
  files.
- The style guide, the `style-reference` draft, VS Code snippets and a PR template cover how to
  write.

## What goes wrong

1. **Publishing is four manual steps, and one gets skipped.** You remove `draft`, set
   `publishedAt`, run `blog:og` and commit the image. Twelve posts went out without a share image
   because nothing ties these steps together.
2. **Edits never set `updatedAt`.** No published post has one, so search engines and readers can't
   tell that a post was revised.
3. **The sentence and filler checks miss text around links.** `blog-lint.ts:163-186` checks each
   text node separately. A link splits a sentence into several nodes, so a 45-word sentence
   containing a link is counted as three short ones and never flagged. A filler phrase that crosses
   a link is missed the same way.
4. **The filler list and the style guide disagree.** The guide names "leverage" and "empower" as
   words to avoid, but `TELLS` (`blog-lint.ts:48`) checks neither.
5. **Glossary entries and topic guides get only a schema check.** Their bodies skip the voice, link
   and sentence rules, and CI doesn't run when only `content/glossary` or `content/guides` changes.
6. **`blog:new` stops short.** It doesn't ask for tags or start the cover from `cover-template.svg`,
   so every new post opens with two warnings and a hand copy.
7. **There's no single view of the content.** To see drafts, scheduled posts, thin topics and tags
   one post short of a page, you have to read folders.

## Phase 1: One command to publish (about half a day)

**`pnpm blog:publish <slug> [--on YYYY-MM-DD]`** in `scripts/blog-publish.ts`:

1. Run the same checks as `blog:check <slug>`, and stop if any error remains.
2. In the frontmatter, remove `draft: true` and set `publishedAt` to `--on`, or to the writer's
   local date. Edit only those lines, so the rest of the file is untouched.
3. Draw that post's `og.jpg`. To do this, move the body of `blog-og.ts` into an exported
   `drawShareImages(slugs, { build })` that both scripts call.
4. Print what changed and what to commit.

Update the README quick start, the style guide's "Before you open the PR" list and the PR template.
Each has one publish line in place of the manual steps.

**Test:** one unit test for the frontmatter edit. Rewriting a writer's file is where a slip loses
work: other fields, comments and CRLF line endings must come through unchanged.

## Phase 2: Checks that catch what they promise (about half a day)

- **Check sentences per paragraph.** Run the long-sentence, filler and em dash checks on a
  paragraph's whole text (`textOf(paragraph)`) instead of on each text node, and report the
  paragraph's line. This fixes problem 3.
- **Match the filler list to the guide.** Add the words the guide names (leverage, empower) plus a
  few common abstract ones (crucial, pivotal, robust, landscape as a metaphor). Each word must be
  one the guide names or explains. Add the new ones to the guide's Voice list in the same change.
- **Paragraph length.** The guide asks for three or four sentences a paragraph. Make more than six a
  warning.
- **Ask for `updatedAt` on real revisions.** In CI, `blog:check --base origin/main` compares each
  published post with main. If more than a few lines of the body changed and `updatedAt` didn't,
  add a suggestion, not a warning, so typo fixes stay quiet.
- **Nudge tags that are one post short.** If a post uses a tag that has two posts, suggest
  "one more post on X gives it a page".

**Test:** extend the existing "catches what the build lets through" case in `blog-lint.test.ts` with
a long sentence that contains a link. Don't add a new test.

## Phase 3: Glossary and guides get the same checks (about 2 hours)

- Run the body rules from phase 2, plus the internal-link check, on
  `content/glossary/*/*.mdx` and `content/guides/*/*.mdx` in `blog:check`.
- Warn when an entry's `short` is the same as the start of its body, since readers then see the
  same text twice on the term page.
- Add `content/glossary/**`, `content/guides/**` and `scripts/blog-*.ts` to the `paths` of
  `.github/workflows/blog.yml`.

There's no new test. The rules are the ones phase 2 already tests.

## Phase 4: A better start (about 2 hours)

- `blog:new` asks for up to three tags. It shows how many posts each has, and marks the ones under
  three as "no page yet".
- It copies `cover-template.svg` to `cover.svg` and `cover-dark.svg` beside the post.
  `blog:check` warns while a cover is still byte-for-byte the template, so a placeholder can't ship.
- `blog:check --watch <slug>` reruns the checks whenever the post's folder changes, so the dev
  server and the checks sit side by side.

## Phase 5: One content status report (about 2 hours)

`pnpm blog:status` replaces `blog:translations` and prints:

- drafts, and scheduled posts with their dates
- posts per topic and per tag, marking topics with one post and tags one short of a page
- for each post, the translations that exist and the ones older than the English

This is what an editor checks before planning the next posts.

## Later: translating a post

When the first translation is planned, add `blog:new --translate <slug> --lang <lang>`. It copies
`en.mdx` to `<lang>.mdx` as a draft, keeping the components, imports and `publishedAt`. The checks
already work per locale, and `blog:status` shows staleness. Don't build this before someone is going
to translate.

## Not planned

- **An in-browser editor or CMS.** Posts are MDX in git, reviewed in PRs. A CMS would bypass the
  guard and the review.
- **AI drafting inside the tools.** The style guide and checks exist to keep the writing specific
  and sourced.

## Suggested order

1. Phase 1: it fixes the mistake that already happened.
2. Phase 2, then phase 3, which reuses phase 2's rules.
3. Phase 4 and phase 5 whenever someone is next writing posts.

Each phase is one commit. Run only the test it touches:

```bash
pnpm --filter marketing exec vitest run scripts/blog-lint.test.ts
```

```bash
pnpm --filter marketing exec vitest run scripts/blog-publish.test.ts
```
