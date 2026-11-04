import { Node } from "@tiptap/react"

import { CALLOUT, safeStyle, styled } from "../email-styles"

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes: () => ({
    style: {
      default: CALLOUT,
      parseHTML: (element) => safeStyle(element.getAttribute("style")),
    },
  }),

  parseHTML: () => [{ tag: "div[style]" }],

  renderHTML: ({ node }) => [
    "div",
    styled(node.attrs.style as string | null),
    0,
  ],
})
