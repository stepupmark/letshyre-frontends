import { Node } from "@tiptap/react"

export interface MergeFieldOptions {
  labelOf: (key: string) => string | null
}

export const MergeField = Node.create<MergeFieldOptions>({
  name: "mergeField",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addOptions: () => ({ labelOf: () => null }),

  addAttributes: () => ({
    key: {
      default: "",
      parseHTML: (element) => element.getAttribute("data-merge") ?? "",
      renderHTML: (attributes) => ({ "data-merge": attributes.key as string }),
    },
  }),

  parseHTML: () => [{ tag: "span[data-merge]" }],

  renderHTML: ({ node, HTMLAttributes }) => [
    "span",
    HTMLAttributes,
    `{{${node.attrs.key as string}}}`,
  ],

  renderText: ({ node }) => `{{${node.attrs.key as string}}}`,

  addNodeView() {
    const { labelOf } = this.options
    return ({ node }) => {
      const key = node.attrs.key as string
      const label = labelOf(key)
      const dom = document.createElement("span")
      dom.contentEditable = "false"
      dom.dataset.merge = key
      dom.dataset.known = String(label !== null)
      dom.textContent = label ?? `{{${key}}}`
      return { dom }
    }
  },
})
