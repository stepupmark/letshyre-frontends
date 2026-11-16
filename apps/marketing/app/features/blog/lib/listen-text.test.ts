import { expect, it } from "vitest"

import { listenBlocks, pickVoice } from "./listen-text"

const post = (html: string) => {
  const root = document.createElement("article")
  root.innerHTML = html
  return root
}

it("reads what the post says, once, and skips the page's own furniture", () => {
  const root = post(`
    <p>Ask about the <button>notice period</button><span popover="auto">Notice period
      The time you must serve. Read more</span> early<button data-no-listen>1</button>.</p>
    <ol><li><div><p>Write the brief</p><p>Start with the outcome.</p></div></li></ol>
    <aside role="note"><div><p>Get it in writing.</p></div></aside>
    <aside data-no-listen><p>Hire faster with LetsHyre</p></aside>
    <div data-no-listen><p>Monthly pay</p></div>
    <details><summary>Can I negotiate?</summary><div><p>Yes, politely.</p></div></details>
    <section data-no-listen><h2>Notes</h2><ol><li>A footnote.</li></ol></section>
  `)

  expect(listenBlocks(root, "Offers", "en").map((b) => b.text)).toEqual([
    "Offers",
    "Ask about the notice period early.",
    "Write the brief",
    "Start with the outcome.",
    "Get it in writing.",
    "Can I negotiate?",
    "Yes, politely.",
  ])
})

it("splits a long paragraph at sentence ends, every part pointing at that paragraph", () => {
  const sentence =
    "This sentence is about sixty characters long, give or take. "
  const root = post(`<p>${sentence.repeat(12)}</p>`)
  const [, ...parts] = listenBlocks(root, "Title", "en")

  expect(parts.length).toBeGreaterThan(1)
  for (const part of parts) {
    expect(part.text.length).toBeLessThanOrEqual(300)
    expect(part.text.endsWith(".")).toBe(true)
    expect(part.el).toBe(root.querySelector("p"))
  }
  expect(parts.map((p) => p.text).join(" ")).toBe(sentence.repeat(12).trim())
})

it("picks the reader's regional voice, then the default, for the post's language", () => {
  const voice = (lang: string, isDefault = false) =>
    ({ lang, default: isDefault, voiceURI: lang }) as SpeechSynthesisVoice
  const voices = [
    voice("en-US"),
    voice("hi-IN"),
    voice("en_IN"),
    voice("en-GB", true),
  ]

  expect(pickVoice(voices, "en", ["en-IN", "hi"])?.voiceURI).toBe("en_IN")
  expect(pickVoice(voices, "en", ["fr-FR"])?.voiceURI).toBe("en-GB")
  expect(pickVoice(voices, "ta", ["en-IN"])).toBeUndefined()
})
