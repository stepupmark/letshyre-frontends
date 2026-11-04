import { Extension } from "@tiptap/react"

import { safeStyle, styled } from "../email-styles"

/** Keeps the inline CSS of starter templates on the blocks that carry it. */
export const PreserveStyle = Extension.create({
  name: "preserveStyle",
  addGlobalAttributes: () => [
    {
      types: [
        "paragraph",
        "heading",
        "bulletList",
        "orderedList",
        "listItem",
        "blockquote",
      ],
      attributes: {
        style: {
          default: null,
          parseHTML: (element) => safeStyle(element.getAttribute("style")),
          renderHTML: (attributes) => styled(attributes.style as string | null),
        },
      },
    },
  ],
})
