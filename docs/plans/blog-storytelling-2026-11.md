# Blog storytelling: November 2026

The 12 published posts are accurate and sourced, and each one reads well alone. Read three in a row,
though, and you can see the template. This plan covers the writing itself: `docs/blog-style.md`, the
posts in `apps/marketing/content/blog`, `app/lib/blog/authors.ts` and the checks in
`scripts/blog-*.ts`.

## Status

Phases 1, 3, 4 and 5 are done. Phase 2 waits on you: the authors' details, and the first people
who agree to be quoted.

- The 11 posts other than `why-we-built-letshyre` now end on the reader's next step, most of them
  calling back to their opening. Four keep one plain sentence about LetsHyre where the post leads
  there: notice periods, CTC on the profile, interview practice and recorded interviews.
  `why-we-built-letshyre` is the product post, so its ending stays.
- The composite opening in `cost-of-a-slow-hire` is now marked as an example.
- `blog:check` flags none of the habits on any post, and `blog:status` finds no closings that read
  alike. The one phrase left in three or more posts is the name of the Willo report.
- The sentence check now ends a sentence at a closing quote, which turned up one paragraph of
  quoted fragments in `skills-over-degrees`.
- The rewrites went in as one commit, not one per post. Each post's `updatedAt` is 2026-11-11.

## What a reader notices

Counted across the 12 published English posts:

1. **Every post has the same shape.** Most open on a scene. All 12 then have one `<Steps>` and one
   `<Callout>`, 10 have a `<Compare>` and 9 a `<Stat>`. The components are fine. Reaching for every
   one of them in every post is the template showing.
2. **The stories have nobody in them.** "Every hiring manager has a version of this story" and
   "Picture the same Tuesday from two desks" are composites. No published post quotes a real
   person, and none is signed: `AUTHORS` is empty. A story with no one in it is an illustration.
3. **They all end the same way.** Every post but `why-we-built-letshyre` closes with a
   near-identical paragraph: what LetsHyre does, "it's free for candidates", and in 10 of them a
   link to `why-we-built-letshyre`. Readers who finish two posts read that paragraph twice. The
   automatic `PostCta` under the post already says the same.
4. **A house voice built from tics.** Each one is fine on its own. Together they read as one
   generated voice:
   - "actually" 24 times, 7 of them in `skills-over-degrees`
   - the "isn't X. It's Y" reversal 14 times
   - "That's the …" 11 times
   - "the real …" and "honest" 13 times
   - "…, exactly." as a shrug, twice
5. **The style guide contradicts the best posts.** It says to open with the answer. The posts that
   work best open with a moment, such as the 20 lakh offer whose first payslip is nowhere near it,
   and get to the answer in the second paragraph. The guide says nothing about how to tell a story,
   so each writer reaches for the same moves.
6. **The checks see words, not patterns.** `blog:check` flags _leverage_ but can't see that three
   posts end with the same sentence.

## Phase 1: A storytelling section in the style guide (about 2 hours)

Add "Telling it as a story" to `docs/blog-style.md`, with a before and after taken from our own
posts. The rules:

- **Open on a moment, answer by the second paragraph.** One concrete scene with a time, a place or a
  number, then the point. This replaces "the answer first" and keeps what it was for.
- **A real case beats a composite.** When the example is invented, say so in the sentence ("say
  you're hiring a backend lead"). Don't dress a composite up as a memory.
- **Carry one example through.** Bring the opening person or number back in the middle and the
  end. `negotiate-offer-india` does this with the 20 lakh offer, and it's the strongest post.
- **Show the turn.** Every story has a point where the obvious answer stops working. Name it in one
  sentence, and that's where the section heading belongs.
- **End on the reader's next move, in the story's terms.** Not a summary, not a pitch.
- **Use only the components the post needs.** A post with no `<Steps>` is fine. The style
  reference shows what each one is for, not a checklist to fill.
- **Patterns to avoid**, each with a one-line fix:
  - "isn't X. It's Y" more than once a post
  - "actually" as an intensifier
  - "…, exactly."
  - "Here's the thing"
  - a rhetorical question as the first line
  - lists of three made to be three

Add two lines to "Before you open the PR":

- Listen to it with the post's Listen button. Anything you wouldn't say out loud, rewrite.
- Could another hiring blog publish this paragraph unchanged? Then it says nothing about ours.

## Phase 2: Real people in the posts (ongoing, starts with one afternoon)

This phase needs you. It can't be written from the repo.

- **Sign posts.** Fill `AUTHORS` with the people who write, with their name, job title, a profile
  link and an optional photo. `PostHeader` and the article schema already use them. Signed posts
  can say "I" where the writer was there.
- **Collect stories with consent.** Keep a short list of hiring managers and candidates who've used
  LetsHyre and agreed to talk. Ask each one for a single moment, like the offer that fell through or
  the interview answer that won the role. Use `<Quote>` for what they said, in their own words, with
  their permission recorded in the PR.
- **Use our own data, carefully.** Where an aggregate is safe to share, such as the median days
  from scorecard to first contact, it's a better opening than another survey. It needs a source line
  like any other number.

## Phase 3: Checks for the patterns (about half a day)

In `scripts/blog-text.ts`, as suggestions rather than warnings, so they guide without blocking:

- "isn't/aren't … It's/They're" used more than once in a post
- "actually" more than twice in a post
- "…, exactly." added to `TELLS`
- a first line that is a question

In `scripts/blog-status.ts`, two reports across all posts, which a single-post check can't see:

- **Shared closings.** Last paragraphs that share a fifth or more of their three-word phrases with
  another post's. The pitch endings sit between 22% and 49%, the rest below 20%.
- **House phrases.** Any five-word phrase used in three or more posts, so the editor sees the voice
  before readers do.

**Test:** extend the existing "catches what the build lets through" case in `blog-lint.test.ts` with
a repeated reversal. No new test for `blog:status`; it only prints.

## Phase 4: Rewrite the 12 posts (about 1 to 2 hours each)

One commit per post, each setting `updatedAt` (`blog:check --base` asks for it):

1. Drop the closing pitch paragraph. End on the reader's next step and let `PostCta` carry the
   product. Keep `<Feature>` or an inline link only where the text leads to it naturally.
2. Fix the tics from phase 3.
3. Label composites as examples, and swap one for a real case where phase 2 has turned one up.
4. Remove a component where it repeats what the paragraph above it said.
5. Bring the opening example back in the ending where the post has one.

Start with the posts that carry the most: `skills-over-degrees`, `cost-of-a-slow-hire`,
`resumes-look-alike`. Leave `negotiate-offer-india` until last; it's the model for the others. The
share images don't change, since titles stay the same.

## Phase 5: Templates that start writers in the right place (about 1 hour)

- `blog:new` writes a skeleton with the opening as "The moment: who, when, what went wrong" and the
  ending as "What the reader does next", in place of the generic section prompts.
- `style-reference` gets a short note per component on when not to use it.

## Not planned

- **New components.** The posts use too many components, not too few.
- **TL;DR boxes, "key takeaways" or summaries at the top.** They're a template signal of their own,
  and the opening paragraph already does that job.
- **AI rewriting tools or a "humanise" pass.** That makes the problem worse. The checks point at
  patterns, and a person fixes them.
- **Invented case studies or testimonials.** Every story is real and agreed to, or labelled as an
  example.

## Suggested order

1. Phase 1, because the rewrite needs the rules written down.
2. Phase 3, so the checks catch the patterns as the posts are rewritten.
3. Phase 4, a few posts a week, pulling in phase 2 material as it arrives.
4. Phase 5 before the next new post.

Phase 2 starts whenever you can name the authors and the first people to ask.
