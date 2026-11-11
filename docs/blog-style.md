# How we write the blog

The LetsHyre blog is read by hiring managers, recruiters and people looking for their next role. They
come with a question. A good post answers it early, proves it, and tells them what to do next.

For the mechanics (frontmatter, components, images) see `apps/marketing/content/blog/README.md`. For
every component in use, open the `style-reference` draft on dev or staging.

## Structure

- **A moment, then the answer.** Open on one concrete scene, with a time, a place or a number, and
  give the short answer by the second paragraph. Background comes after, if at all.
- **One idea per `##` section.** Write headings as plain statements a reader can skim: "Ask every
  candidate the same questions", not "Consistency".
- **Three or four sentences a paragraph.** `blog:check` warns on sentences over 35 words and
  paragraphs over six sentences.
- **End with an action** the reader can take today, not a summary of what they just read, and not a
  pitch. The call to action under every post already covers LetsHyre.
- **4 to 8 minutes** suits most topics. Longer posts need more sections, not longer ones.

## Telling it as a story

A post is about someone in a situation the reader recognises. The facts carry more when they happen
to that someone.

- **A real case beats a composite.** If the example is invented, say so in the sentence: "say you're
  hiring a backend lead". Don't dress a composite up as a memory.
- **Carry one example through.** Bring the opening person or number back in the middle and at the
  end. `negotiate-offer-india` opens on a 20 lakh offer and works through the same number to the
  end.
- **Show the turn.** Every story has a point where the obvious answer stops working: the offer that
  looks generous until the payslip, the process nobody slowed down that still took six weeks. Say it
  in one sentence. That's usually where a heading belongs.
- **Use only the components the post needs.** A post with no `<Steps>` or `<Compare>` is fine. The
  style reference shows what each one is for, not a list to fill.

Before:

> Every hiring manager has a version of this story. The candidate was perfect.

After:

> Say you're hiring a backend lead. Your favourite candidate gets the offer on a Thursday, and on
> Friday they tell you they accepted another one on Tuesday.

## Voice

- Write to one reader, as "you". Use "we" for LetsHyre.
- Say the specific thing. "Most offers fail in the week after the final interview" beats "timing is
  crucial".
- Plain words: "use", not "leverage"; "help", not "empower"; "key" or the reason itself, not
  "crucial" or "pivotal". `blog:check` flags these and the usual filler ("delve", "game-changer",
  "in today's fast-paced world"). To write about such a word, put it in italics: _leveraged_.
- No em dashes. End the sentence or use a comma.
- Watch for habits that make every post sound alike. `blog:check` suggests a fix for each:
  - "isn't X. It's Y" more than once a post. Say the second half on its own.
  - "actually" as an intensifier. Cut it, or keep it where it marks a real contrast.
  - "…, exactly." as a shrug. Say what was or wasn't wrong.
  - A question as the first line. Open on what happened.
  - Lists of three made to be three. Use as many items as there are.
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
- [ ] You listened to it with the post's Listen button and rewrote anything you wouldn't say aloud
- [ ] No paragraph could run unchanged on another company's hiring blog
- [ ] Published with `pnpm --filter marketing blog:publish <slug>`, when it's ready to go live
