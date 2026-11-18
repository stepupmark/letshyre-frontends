# Blog: a natural voice for listening

Status: proposal, nothing built. Follows `blog-listen.md`.

## Why it sounds like a machine

The player speaks through the browser's `speechSynthesis`, so the voice is whatever the reader's
device ships. `pickVoice` chooses by language and region only, so on Windows Chrome it often lands on
an old local SAPI voice (Microsoft Heera, Ravi, David) when a much better network voice is in the
same list. Browsers don't take SSML either, so there's no control over pauses, emphasis or how
"CTC" or "₹1.66 lakh" is said.

Choosing a better voice helps a lot on some devices and not at all on others. A human-sounding voice
on every device means recorded audio from a neural text-to-speech service.

## Plan

Two phases. Phase 1 is small and ships on its own; phase 2 is the real fix.

### Phase 1: get the best voice the browser has

`lib/listen-text.ts`, `hooks/use-listen.ts`. No new dependency, no new copy.

- **Rank voices by quality before region.** In `pickVoice`, score each voice for the language:
  - 2 if its name says it's a neural voice: `/natural|neural|online|enhanced|premium/i` (Edge's
    "Microsoft Neerja Online (Natural)", Safari's "(Enhanced)" and "(Premium)") or it is a Google
    network voice (`/^google/i`).
  - 1 if `localService` is false.
  - 0 otherwise.

  Highest score wins; the reader's region (`en-IN`) breaks ties, then `default`.

- **Pause like a reader.** Wait about 400 ms after the title and a heading, and about 150 ms between
  other blocks, before speaking the next one (a timer in `onend`, cleared by the generation check).
  Back-to-back utterances are a big part of why it sounds read by a machine.
- Extend the existing `pickVoice` test with a neural voice beating a local one in the reader's
  region. No new test file.

Limit: on Android, Safari and Linux the list may hold no good voice, and this changes nothing there.

### Phase 2: recorded neural audio for each post

Generate an audio file per post ahead of time, play it with `<audio>`, and keep the browser voice
as the fallback for posts without audio. It fits the marketing app's rule of no API at runtime: the
TTS service is called from a script on a developer's machine, never from the site.

#### Choose a provider

|                                                 | Azure AI Speech           | Google Cloud TTS              | ElevenLabs                   |
| ----------------------------------------------- | ------------------------- | ----------------------------- | ---------------------------- |
| Indian English                                  | Neerja, Prabhat (`en-IN`) | Neural2, Chirp 3 HD (`en-IN`) | Accent from the voice chosen |
| All 19 site locales                             | Yes                       | Nearly all                    | Most                         |
| Sounds                                          | Natural                   | Natural (Chirp 3 HD best)     | The most human               |
| Cost for all 26 posts (~130k spoken characters) | A few dollars             | A few dollars                 | Tens of dollars              |

All posts are English today (26 `en.mdx`), so the whole library costs one small one-off run, and
then only new or edited posts. Check current prices before choosing.

**Recommendation: Azure, voice `en-IN-NeerjaNeural`.** It has a natural Indian English voice, every
locale the site may translate into, and SSML for pauses and pronunciation. Pick ElevenLabs instead if
the most human English matters more than other languages.

#### Generate (new `apps/marketing/scripts/post-audio.ts`, `pnpm --filter marketing audio [slug]`)

1. Read the prerendered page from `build/client/en/blogs/<slug>/index.html` and run the same
   `listenBlocks` over it in jsdom. The audio then has exactly the blocks the player highlights.
2. Apply a small pronunciation list, `content/blog/pronounce.json`, for words the voice gets wrong:
   "CTC", "PF", "HRA", "LetsHyre", "lakh". Applied through SSML `<sub alias>` so the text on the page
   doesn't change.
3. Synthesize block by block, with SSML breaks after headings, as 48 kbps mono MP3. One request per
   block gives the exact start time of every block from each clip's length (constant bitrate, so
   bytes ÷ bitrate), with no word-timing API.
4. Join the clips into `<slug>.<hash>.mp3`. Clips from the same voice and bitrate join frame by frame.
5. Write `content/blog/<slug>/audio.json`: `{ src, voice, hash, duration, starts: number[] }`. `hash`
   is the hash of the block texts.

The API key is read from the developer's environment and never reaches `VITE_*` or CI.

#### Store

About 3 MB per post, about 80 MB for the library, which shouldn't live in git. **Open decision:**
put the MP3s in the object storage or CDN the site is served from, and add that origin to
`media-src` in the marketing CSP sources (`tooling/csp.ts` already supports `media`). Only
`audio.json` is committed.

#### Wire into the post

- The post loader reads `audio.json`, parsed with Zod, into `post.audio`. At build time, if `hash`
  no longer matches the post's blocks, the audio is dropped with a postbuild warning, so edited text
  never plays stale audio. The post falls back to the browser voice until someone reruns the script.
- `useListen` keeps its interface (`status`, `index`, `blocks`, `previous`, `next`, `cycleRate`,
  `stop`) and gets a second engine behind it for `post.audio`:
  - one `<audio preload="none">`, so no bytes load until Listen is pressed
  - real pause and resume, with no restarting the block
  - previous and next seek to `starts[index ∓ 1]`
  - speed through `playbackRate`, which keeps the pitch
  - `index` follows `timeupdate`, so highlighting and section names work as now
- Media Session metadata and actions (play, pause, previous, next). With a real `<audio>` it works:
  lock-screen and headphone controls, and audio keeps playing when the phone screen locks, which the
  browser voice can't do.
- `available` is true when the post has audio, even if the browser has no voice for the language.
- No UI change: same header button, same player.

#### Tests

- The function that maps `currentTime` to a block index from `starts` (edges: before the first
  start, exactly on a start, past the end).
- The postbuild staleness check: a changed block text drops the audio.

Nothing for the generator's network calls; it is run by hand and its output is listened to.

## Left out on purpose

- **Synthesizing in the reader's browser through an API**: the marketing site has no API, and it
  would cost per listen instead of once per post.
- **A voice picker in the player**: phase 1 picks the best voice already, and phase 2 has one
  chosen voice.
- **Word-by-word highlighting**: block-level is enough to follow along, and it would need a word
  timing API.

## Checks

```bash
pnpm --filter marketing exec vitest run app/features/blog/lib/listen-text.test.ts
pnpm --filter marketing build
```

Listen to two posts in full before publishing the audio: one with numbers in rupees and lakh, and
one with glossary terms.
