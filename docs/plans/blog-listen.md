# Blog: listen to a post

Status: built. Scope is `apps/marketing/app/features/blog` only. No new
dependency, no API, no new package.

## What's there now

`components/listen-button.tsx` reads the post with the browser's `speechSynthesis`. It is
lazy-loaded after hydration, hides itself when the browser has no voice for the post's language,
and queues every block of the post as utterances in one go. Pause, resume and stop live in the
post header only.

## Problems found

What it reads (checked against the 28 English posts):

| Problem                                                                       | Cause                                                                          | Posts hit |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------- |
| Glossary words are read twice, with the definition and "Read more" after them | `textContent` of a `<p>` includes the `Term` popover that is always in the DOM | 16        |
| A step's title runs into its body ("Write the briefStart with…")              | the outer `<li>` is read whole, and JSX puts no whitespace between its `<p>`s  | 23        |
| Callouts (notes, tips, warnings) are never read                               | `SKIP` contains `aside`, and `Callout` is an `<aside>`                         | 18        |
| FAQ answers are read without their questions                                  | `summary` isn't in the block selector                                          | 3         |
| Footnote numbers are read mid-sentence, then the whole notes list at the end  | nothing marks them as skippable                                                | 1         |
| The title isn't read                                                          | reading starts at the body                                                     | all       |

How it plays:

- **Pause does nothing on Android Chrome**, where `speechSynthesis.pause()` isn't supported.
- **It can get stuck on "Pause"**: state goes back to idle only on the last utterance's `onend`;
  an `onerror` or a cancelled queue never resets it.
- **Long paragraphs get cut off** with Chrome's network voices, which stop after about 15 seconds of
  one utterance.
- **The first voice for the language wins**, e.g. a US voice for a reader whose browser is `en-IN`.

UI:

- Once the reader scrolls past the header the controls are gone, so pausing means scrolling back up.
- Nothing shows which part is being read.
- No skipping and no speed control.
- Stop removes itself, so keyboard focus falls to `<body>`.

## Plan

Three slices, each shippable alone, in this order.

### Slice 1: read the right text

New `lib/listen-text.ts`, a pure function `listenBlocks(root, title, locale)` returning
`{ text: string; el: HTMLElement | null }[]`.

- Walk text nodes under the post body with a `TreeWalker`. Reject a subtree when it matches
  `[data-no-listen], [aria-hidden], [popover], nav`. Give each text node to its nearest block
  ancestor (`h2, h3, h4, p, li, summary, blockquote, figcaption`), so nested blocks become their
  own entries and a step title and body come out as two blocks.
- First block is the post title with `el: null`.
- Split a block over about 300 characters into sentences with
  `Intl.Segmenter(locale, { granularity: "sentence" })`, so no utterance hits Chrome's cut-off.
  All chunks keep the block's `el`.
- Mark what isn't part of what the post says with `data-no-listen`, instead of skipping by tag:
  the `FootnoteRef` button, the `Footnotes` section and `InlineCta`. `ToolFrame` already has it.
  Remove `aside` from the skip list so callouts are read; their `sr-only` tone label ("Tip")
  comes first, which is what a listener needs.
- `pickVoice(voices, lang, preferred: readonly string[])`: exact match with one of
  `navigator.languages` (`en-IN`), then the language's `default` voice, then the first one for the
  language. It replaces `voiceFor`.

Test `lib/listen-text.test.ts`, building the DOM with Testing Library:

- a `Term` inside a paragraph is read once, without its definition
- a `Step` gives its title and body as separate blocks
- a callout is read; an inline CTA, a tool and a footnote reference are not
- an FAQ question comes before its answer
- a long paragraph is split at sentence ends and every chunk points at the same element
- `pickVoice` prefers the reader's region, then the default

### Slice 2: one utterance at a time

New `hooks/use-listen.ts`, the playback engine. It holds real behaviour, so it earns a hook.

- State: `blocks`, `index`, `status` (`idle | playing | paused`), `rate`.
- `speakAt(i)`: `cancel()`, then speak `blocks[i]` alone; `onend` speaks `i + 1`, or goes idle after
  the last one. Each call bumps a generation number, and callbacks from an older generation are
  ignored. Chrome fires `onend`/`onerror` on cancelled utterances, which is what made the old state
  wrong.
- `onerror` with `interrupted` or `canceled` is ignored; any other error goes idle.
- **Pause is `cancel()` keeping `index`; resume is `speakAt(index)`.** It restarts the sentence
  rather than the word, but it works the same in every browser, Android included.
- `previous()` / `next()` call `speakAt(index ∓ 1)`, clamped.
- Rate: `0.75, 1, 1.25, 1.5, 2`, stored with `localStore("listen-rate", z.enum(...), 1)`. A change
  restarts the current chunk at the new rate.
- Cancel on unmount (as today) and on `pagehide`, since Chrome can keep talking across a reload.
- While playing, set `data-listening` on the current block's `el` and remove it from the previous
  one. If the previous block was in view and the new one isn't, `scrollIntoView({ block: "center" })`,
  `behavior: "auto"` under reduced motion. If the reader has scrolled away, leave them there.

Test `hooks/use-listen.test.ts` against a fake `speechSynthesis`:

- blocks are spoken in order and it goes idle after the last
- a stale `onend` after pause doesn't move on
- resume speaks the paused block again
- a non-cancel error resets to idle

### Slice 3: controls that follow the reader

**Header button** (`listen-button.tsx`): one button that plays or pauses, labelled Listen, Pause or
Keep listening as now. Stop moves to the player. The component calls `useListen` and renders the
player, so both stay in the existing lazy chunk and the initial JS budget doesn't move.

**Player** (new `components/listen-player.tsx`), shown while status isn't `idle`:

- Fixed at the bottom, `print:hidden`, `role="region"` with an `aria-label`. Border and
  `bg-background`, no shadow. Centred and content-wide from `sm`; on phones it runs from
  `inset-s-4` to clear the back-to-top button at the end.
- Contents, in order: the current section's heading (the last `h2` at or before `index`, truncated),
  a thin `Progress` from `@workspace/ui` for block `index` of `blocks.length`, then Previous,
  Play/Pause, Next, Speed (`1.25×`, cycles) and Stop.
- Icon buttons use `size="icon"` with `aria-label`s; `SkipBackIcon` and `SkipForwardIcon` take
  `rtl:-scale-x-100`. Speed and the progress numbers get `tabular-nums`.
- Appears with a CSS transition on `opacity` and `translate` from `starting:` styles, 200 ms,
  `motion-reduce:transition-none`. No exit animation, so no motion chunk.
- Stop returns focus to the header button through a ref.

**Current block**: on the `<article>` in `post-page.tsx`, style the marked block with
`**:data-listening:bg-muted **:data-listening:rounded-sm` and a `ring` in the same colour for
padding, so the text doesn't move.

**Copy** in `locales/en/blog.json` under `post`: `player` ("Listening"), `previous`, `next`,
`speed` ("Speed {{rate}}×"), `progress` ("{{current}} of {{total}}"). The existing `stopListening`
is reused. All 19 locales through `pnpm i18n:apply`.

## Left out on purpose

- **Media Session (lock screen and headphone keys)**: Chrome only routes those to pages playing a
  media element, not `speechSynthesis`.
- **Pre-generated audio files**: needs a TTS service and storage. Revisit only if browser voices
  for Indian languages prove too poor to ship.
- **Click a paragraph to listen from there**, **word-level highlighting** (`onboundary` is missing
  in Safari and most network voices) and **a listening-time estimate**: none fixes a problem found
  above.

## Checks

```bash
pnpm --filter marketing exec vitest run app/features/blog/lib/listen-text.test.ts app/features/blog/hooks/use-listen.test.ts
pnpm --filter marketing lint
pnpm --filter marketing typecheck
pnpm --filter marketing build
```

The build checks the JS budget; the player has to stay inside the lazy chunk.

No Playwright test: headless Chromium has no voices, so the button never renders. Check by hand:

- Chrome on Windows, Chrome on Android (pause and resume), Safari on iOS
- English and Hindi posts, an Arabic post for RTL (player layout, skip icons)
- 360 px: the player clears back-to-top; a Sonner toast (save, "continue reading") may sit over it
  for a few seconds, which is acceptable
- a post with glossary terms, steps, a callout, an FAQ and footnotes, listening for the problems in
  the table
