import { isButtonStyle } from "./email-styles"
import { tokenPattern } from "./merge-fields"

const parse = (html: string) =>
  new DOMParser().parseFromString(`<body>${html}</body>`, "text/html")

function textNodes(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  while (walker.nextNode()) nodes.push(walker.currentNode as Text)
  return nodes
}

function tokensToSpans(doc: Document) {
  for (const node of textNodes(doc.body)) {
    const text = node.data
    const matches = [...text.matchAll(tokenPattern())]
    if (matches.length === 0) continue
    const fragment = doc.createDocumentFragment()
    let last = 0
    for (const match of matches) {
      if (match.index > last) fragment.append(text.slice(last, match.index))
      const span = doc.createElement("span")
      span.dataset.merge = match[1]
      fragment.append(span)
      last = match.index + match[0].length
    }
    if (last < text.length) fragment.append(text.slice(last))
    node.replaceWith(fragment)
  }
}

function anchorToButton(
  doc: Document,
  anchor: HTMLAnchorElement,
  wrap: Element | null
) {
  const button = doc.createElement("div")
  button.dataset.lhButton = ""
  button.dataset.href = anchor.getAttribute("href") ?? ""
  button.dataset.label = anchor.textContent.trim()
  button.dataset.style = anchor.getAttribute("style") ?? ""
  if (wrap) button.dataset.wrap = wrap.getAttribute("style") ?? ""
  ;(wrap ?? anchor).replaceWith(button)
}

/** A styled link that stands alone in its paragraph, or directly in a box, is a button. */
function buttonsToNodes(doc: Document) {
  for (const anchor of doc.body.querySelectorAll("a")) {
    if (!isButtonStyle(anchor.getAttribute("style"))) continue
    const parent = anchor.parentElement
    if (!parent) continue
    const alone = [...parent.childNodes].every(
      (child) => child === anchor || !child.textContent?.trim()
    )
    if (parent.tagName === "P" && alone) anchorToButton(doc, anchor, parent)
    else if (parent.tagName === "DIV" || parent === doc.body)
      anchorToButton(doc, anchor, null)
  }
}

/** Stored template HTML, shaped for the editor's schema. */
export function toEditorHtml(stored: string) {
  const doc = parse(stored)
  buttonsToNodes(doc)
  tokensToSpans(doc)
  return doc.body.innerHTML
}

/** The editor's HTML, back to what the API stores and sends. */
export function fromEditorHtml(html: string) {
  const doc = parse(html)
  for (const element of doc.body.querySelectorAll<HTMLElement>(
    "[data-style]"
  )) {
    element.setAttribute("style", element.dataset.style ?? "")
    element.removeAttribute("data-style")
  }
  for (const span of doc.body.querySelectorAll("span[data-merge]")) {
    span.replaceWith(`{{${span.getAttribute("data-merge") ?? ""}}}`)
  }
  // list items hold their text directly; a <p> inside adds margins in most mail clients
  for (const item of doc.body.querySelectorAll("li")) {
    const only = item.children[0]
    if (
      item.children.length === 1 &&
      only?.tagName === "P" &&
      !only.hasAttribute("style")
    )
      only.replaceWith(...only.childNodes)
  }
  let last = doc.body.lastElementChild
  while (last?.tagName === "P" && last.childNodes.length === 0) {
    last.remove()
    last = doc.body.lastElementChild
  }
  return doc.body.innerHTML
}

function canonical(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE)
    return (node.textContent ?? "").replace(/\s+/g, " ")
  if (!(node instanceof Element)) return ""
  const attributes = [...node.attributes]
    .map((attribute) => `${attribute.name}=${attribute.value.trim()}`)
    .sort()
    .join(" ")
  const children = [...node.childNodes].map(canonical).join("")
  return `<${node.tagName.toLowerCase()} ${attributes}>${children}</>`
}

/** True when the edited HTML says and looks the same as the stored HTML. */
export const sameHtml = (a: string, b: string) =>
  canonical(parse(a).body).trim() === canonical(parse(b).body).trim()
