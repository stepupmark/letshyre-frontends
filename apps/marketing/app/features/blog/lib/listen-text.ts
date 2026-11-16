export interface ListenBlock {
  text: string
  el: HTMLElement | null
}

const SKIP = "[data-no-listen],[aria-hidden],[popover],nav,pre,table"
const BLOCK = "h2,h3,h4,p,li,summary,blockquote,figcaption"
// Chrome's online voices stop about 15 seconds into one utterance, often without an end event;
// 180 characters is about 12 seconds at normal speed
const MAX_CHUNK = 180

const tidy = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .replace(/ ([.,;:!?)])/g, "$1")
    .trim()

/** Joins parts, in order, into pieces no longer than MAX_CHUNK where the parts allow. */
function pack(parts: readonly string[]): string[] {
  const out: string[] = []
  let current = ""
  for (const part of parts) {
    if (current && current.length + 1 + part.length > MAX_CHUNK) {
      out.push(current)
      current = ""
    }
    current = current ? `${current} ${part}` : part
  }
  if (current) out.push(current)
  return out
}

// a sentence too long to say in one go breaks after a comma, or failing that between words
const pieces = (sentence: string): string[] =>
  sentence.length <= MAX_CHUNK
    ? [sentence]
    : pack(
        sentence
          .split(/(?<=[,;:])\s+/)
          .flatMap((clause) =>
            clause.length <= MAX_CHUNK ? [clause] : clause.split(/\s+/)
          )
      )

function chunks(text: string, locale: string): string[] {
  if (text.length <= MAX_CHUNK) return [text]
  const sentences = [
    ...new Intl.Segmenter(locale, { granularity: "sentence" }).segment(text),
  ]
    .map(({ segment }) => segment.trim())
    .filter(Boolean)
  return pack(sentences.flatMap(pieces))
}

// a collapsed answer isn't on screen, so it isn't read; its question is
const hidden = (el: Element) => {
  const details = el.closest("details")
  return details !== null && !details.open && el.closest("summary") === null
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
      !node.parentElement ||
      node.parentElement.closest(SKIP) ||
      hidden(node.parentElement)
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
