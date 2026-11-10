# How we write the blog

The LetsHyre blog is read by hiring managers, recruiters and people looking for their next role. They
come with a question. A good post answers it early, proves it, and tells them what to do next.

For the mechanics (frontmatter, components, images) see `apps/marketing/content/blog/README.md`. For
every component in use, open the `style-reference` draft on dev or staging.

## Structure

- **The answer first.** The opening paragraph says what the reader will get and gives the short
  answer. Background comes after, if at all.
- **One idea per `##` section.** Write headings as plain statements a reader can skim: "Ask every
  candidate the same questions", not "Consistency".
- **Three or four sentences a paragraph.** `blog:check` warns on sentences over 35 words.
- **End with an action** the reader can take today, not a summary of what they just read.
- **4 to 8 minutes** suits most topics. Longer posts need more sections, not longer ones.

## Voice

- Write to one reader, as "you". Use "we" for LetsHyre.
- Say the specific thing. "Most offers fail in the week after the final interview" beats "timing is
  crucial".
- Plain words: "use", not "leverage"; "help", not "empower". `blog:check` flags the usual filler
  ("delve", "game-changer", "in today's fast-paced world").
- No em dashes. End the sentence or use a comma.
- The product is "LetsHyre", the site "letshyre.ai".

## Claims and sources

- A number needs a source. Use `<Stat>` for the one figure a section rests on, and a link for the
  rest. Both are listed under the post.
- Link the study or report itself, not a news story about it, and say who ran it and when.
- No invented examples presented as real. Say "for example" or "imagine" when it's illustrative.
- `<Quote>` only for a real person who agreed to be quoted, in their own words.

## Headline and description

- **Title:** what the reader gets, in their words. Up to 70 characters, or add a shorter
  `metaTitle` for search.
- **Description:** 70 to 160 characters, shown in search results and on the index. It answers "why
  read this", without repeating the title.
- **Slug:** short, lowercase, hyphenated, and fixed once published.

## Images

- A diagram earns its place when it explains something the text can't do as quickly.
- Alt text says what the image shows, as you'd describe it to someone on a call.
- Covers are drawn, not stock. Start from `content/blog/cover-template.svg`.

## Where LetsHyre fits

Write for the reader first. Use `<Feature>` only where the text naturally leads to something
LetsHyre does; a post with one skips the automatic mid-post call to action.

## Before you open the PR

- [ ] `pnpm --filter marketing blog:check <slug>` shows no errors
- [ ] Every number has a source you opened yourself
- [ ] The opening paragraph works on its own
- [ ] `draft: true` removed and `publishedAt` set, when it's ready to go live
