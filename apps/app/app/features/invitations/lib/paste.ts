const DROP =
  "script, style, meta, link, title, img, svg, video, audio, iframe, object, form, input, button"

/** Pasted Word or Docs HTML keeps its words, structure and links, but not its styling. */
export function cleanPastedHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html")
  for (const element of doc.body.querySelectorAll(DROP)) element.remove()
  for (const element of doc.body.querySelectorAll("*")) {
    for (const { name } of [...element.attributes]) {
      if (name !== "href" && name !== "data-merge")
        element.removeAttribute(name)
    }
  }
  for (const element of doc.body.querySelectorAll(
    "span:not([data-merge]), font"
  )) {
    element.replaceWith(...element.childNodes)
  }
  return doc.body.innerHTML
}
