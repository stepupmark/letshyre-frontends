import { Node } from "@tiptap/react"

import { BUTTON_TONES, BUTTON_WRAP, styled, toneOf } from "../email-styles"

export interface EmailButtonOptions {
  onEdit: (pos: number) => void
  editLabel: string
}

export interface ButtonAttributes {
  href: string
  label: string
  style: string
  wrap: string | null
}

export const EmailButton = Node.create<EmailButtonOptions>({
  name: "emailButton",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addOptions: () => ({ onEdit: () => undefined, editLabel: "" }),

  addAttributes: () => ({
    href: { default: "{{invite_link}}" },
    label: { default: "" },
    style: { default: BUTTON_TONES.primary },
    wrap: { default: BUTTON_WRAP },
  }),

  parseHTML: () => [
    {
      tag: "div[data-lh-button]",
      getAttrs: (element) => ({
        href: element.dataset.href ?? "",
        label: element.dataset.label ?? "",
        style: element.dataset.style ?? BUTTON_TONES.primary,
        wrap: element.dataset.wrap ?? null,
      }),
    },
  ],

  renderHTML: ({ node }) => {
    const { href, label, style, wrap } = node.attrs as ButtonAttributes
    const anchor = ["a", { href, ...styled(style) }, label] as const
    return wrap === null ? anchor : ["p", styled(wrap), anchor]
  },

  renderText: ({ node }) => (node.attrs as ButtonAttributes).label,

  addNodeView() {
    const { onEdit, editLabel } = this.options
    return ({ node, getPos }) => {
      const dom = document.createElement("div")
      dom.dataset.emailButton = ""
      dom.contentEditable = "false"
      const button = document.createElement("button")
      button.type = "button"
      const render = (attributes: ButtonAttributes) => {
        button.dataset.tone = toneOf(attributes.style)
        button.textContent = attributes.label
        button.setAttribute("aria-label", `${editLabel}: ${attributes.label}`)
      }
      render(node.attrs as ButtonAttributes)
      button.addEventListener("click", () => {
        const pos = getPos()
        if (typeof pos === "number") onEdit(pos)
      })
      dom.append(button)
      return {
        dom,
        update: (next) => {
          if (next.type.name !== "emailButton") return false
          render(next.attrs as ButtonAttributes)
          return true
        },
        stopEvent: (event) =>
          event.target === button && event.type !== "dragstart",
        ignoreMutation: () => true,
      }
    }
  },
})
