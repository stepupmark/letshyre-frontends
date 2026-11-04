import { InputRule, Node, PasteRule } from "@tiptap/react"

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

  addInputRules() {
    return [
      new InputRule({
        find: /\{\{\s*([\w.-]+)\s*\}\}$/,
        handler: ({ state, range, match }) => {
          state.tr.replaceWith(
            range.from,
            range.to,
            this.type.create({ key: match[1] })
          )
        },
      }),
    ]
  },

  addPasteRules() {
    return [
      new PasteRule({
        find: /\{\{\s*([\w.-]+)\s*\}\}/g,
        handler: ({ state, range, match }) => {
          state.tr.replaceWith(
            range.from,
            range.to,
            this.type.create({ key: match[1] })
          )
        },
      }),
    ]
  },

  addNodeView() {
    const { labelOf } = this.options
    const editor = this.editor
    return ({ node }) => {
      const key = node.attrs.key as string
      const label = labelOf(key)
      const dom = document.createElement("span")
      dom.contentEditable = "false"
      dom.dataset.merge = key
      dom.dataset.known = String(label !== null)
      if (editor.isInitialized) dom.dataset.fresh = ""
      dom.textContent = label ?? `{{${key}}}`
      return { dom }
    }
  },
})
