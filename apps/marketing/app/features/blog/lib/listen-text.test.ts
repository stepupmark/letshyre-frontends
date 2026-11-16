import { expect, it } from "vitest"

import { listenBlocks, spoken } from "./listen-text"

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
    <details open><summary>Is it binding?</summary><div><p>Once signed.</p></div></details>
    <section data-no-listen><h2>Notes</h2><ol><li>A footnote.</li></ol></section>
  `)

  expect(listenBlocks(root, "Offers", "en").map((b) => b.text)).toEqual([
    "Offers",
    "Ask about the notice period early.",
    "Write the brief",
    "Start with the outcome.",
    "Get it in writing.",
    "Can I negotiate?",
    "Is it binding?",
    "Once signed.",
  ])
})

it("splits a long paragraph at sentence ends, every part pointing at that paragraph", () => {
  const sentence =
    "This sentence is about sixty characters long, give or take. "
  const root = post(`<p>${sentence.repeat(12)}</p>`)
  const [, ...parts] = listenBlocks(root, "Title", "en")

  expect(parts.length).toBeGreaterThan(1)
  for (const part of parts) {
    expect(part.text.length).toBeLessThanOrEqual(180)
    expect(part.text.endsWith(".")).toBe(true)
    expect(part.el).toBe(root.querySelector("p"))
  }
  expect(parts.map((p) => p.text).join(" ")).toBe(sentence.repeat(12).trim())
})

it("breaks a sentence too long to say at once after its commas", () => {
  const clause = "and then the offer letter arrives with a different number"
  const root = post(`<p>First, ${Array(5).fill(clause).join(", ")}.</p>`)
  const [, ...parts] = listenBlocks(root, "Title", "en")

  expect(parts.length).toBeGreaterThan(1)
  for (const part of parts) expect(part.text.length).toBeLessThanOrEqual(180)
  expect(parts.map((p) => p.text).join(" ")).toBe(
    `First, ${Array(5).fill(clause).join(", ")}.`
  )
})

it("says rupee amounts and the brand the way a person would", () => {
  expect(
    spoken("Offered ₹18 lakh, up from 28L and ₹1.5Cr vs ₹500.", "en")
  ).toBe(
    "Offered 18 lakh rupees, up from 28 lakh and 1.5 crore rupees versus 500 rupees."
  )
  expect(spoken("Why we built LetsHyre", "en")).toBe("Why we built Lets Hire")
  expect(spoken("₹18 लाख", "hi")).toBe("₹18 लाख")
})
