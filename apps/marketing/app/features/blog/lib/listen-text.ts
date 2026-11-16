export interface ListenBlock {
  text: string
  el: HTMLElement | null
}

const SKIP = "[data-no-listen],[aria-hidden],[popover],nav,pre,table"
const BLOCK = "h2,h3,h4,p,li,summary,blockquote,figcaption"
// Chrome's online voices stop about 15 seconds into one utterance
const MAX_CHUNK = 300

const tidy = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .replace(/ ([.,;:!?)])/g, "$1")
    .trim()

function chunks(text: string, locale: string): string[] {
  if (text.length <= MAX_CHUNK) return [text]
  const out: string[] = []
  let current = ""
  for (const { segment } of new Intl.Segmenter(locale, {
    granularity: "sentence",
  }).segment(text)) {
    if (current && current.length + segment.length > MAX_CHUNK) {
      out.push(current.trim())
      current = ""
    }
    current += segment
  }
  if (current.trim()) out.push(current.trim())
  return out
}

/** The post as the listener should hear it: the title, then each block in order. */
export function listenBlocks(
  root: HTMLElement,
  title: string,
  locale: string
): ListenBlock[] {
  const parts = new Map<HTMLElement, string[]>()
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement?.closest(SKIP)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  })
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const block = node.parentElement?.closest<HTMLElement>(BLOCK)
    if (!block || !root.contains(block)) continue
    const list = parts.get(block) ?? []
    list.push(node.textContent ?? "")
    parts.set(block, list)
  }

  const blocks: ListenBlock[] = [{ text: tidy(title), el: null }]
  for (const [el, texts] of parts) {
    const text = tidy(texts.join(" "))
    if (text)
      blocks.push(...chunks(text, locale).map((part) => ({ text: part, el })))
  }
  return blocks
}

const unit = (u = "") =>
  u.toLowerCase().startsWith("l")
    ? "lakh "
    : u.toLowerCase().startsWith("c")
      ? "crore "
      : ""

/** A block's text as the voice should say it; browsers ignore SSML, so the text is the only lever. */
export function spoken(text: string, lang: string): string {
  if (lang !== "en") return text
  return text
    .replace(
      /₹\s?(\d[\d,]*(?:\.\d+)?)(?:\s?(lakhs?|crores?|L|Cr)\b)?/g,
      (_, amount: string, u?: string) => `${amount} ${unit(u)}rupees`
    )
    .replace(/\b(\d+(?:\.\d+)?)L\b/g, "$1 lakh")
    .replace(/\bLetsHyre\b/g, "Lets Hire")
    .replace(/\bvs\.?(?=\s)/g, "versus")
}
