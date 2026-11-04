import type { Editor } from "@tiptap/react"

import { BUTTON_WRAP } from "../email-styles"
import { INVITE_HREF } from "../link"
import type { MergeField } from "../merge-fields"
import type { ButtonAttributes } from "./email-button"

export type ButtonValues = Omit<ButtonAttributes, "wrap">

export const insertField = (editor: Editor, key: MergeField) =>
  editor
    .chain()
    .focus()
    .insertContent({ type: "mergeField", attrs: { key } })
    .run()

export const insertCallout = (editor: Editor) =>
  editor
    .chain()
    .focus()
    .insertContent({ type: "callout", content: [{ type: "paragraph" }] })
    .run()

/** Links the selection, or inserts the link itself when nothing is selected. */
export function applyLink(editor: Editor, href: string) {
  const chain = editor.chain().focus()
  if (!editor.state.selection.empty || editor.isActive("link")) {
    chain.extendMarkRange("link").setLink({ href }).run()
    return
  }
  const marks = [{ type: "link", attrs: { href } }]
  chain
    .insertContent(
      href === INVITE_HREF
        ? { type: "mergeField", attrs: { key: "invite_link" }, marks }
        : { type: "text", text: href, marks }
    )
    .run()
}

export const linkAt = (editor: Editor) =>
  (editor.getAttributes("link").href as string | undefined) ?? null

export const removeLink = (editor: Editor) =>
  editor.chain().focus().extendMarkRange("link").unsetLink().run()

export const buttonAt = (editor: Editor, pos: number | null) => {
  const node = pos === null ? null : editor.state.doc.nodeAt(pos)
  return node?.type.name === "emailButton"
    ? (node.attrs as ButtonAttributes)
    : null
}

export function saveButton(
  editor: Editor,
  pos: number | null,
  values: ButtonValues
) {
  if (pos === null) {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "emailButton",
        attrs: { ...values, wrap: BUTTON_WRAP },
      })
      .run()
    return
  }
  editor
    .chain()
    .focus()
    .command(({ tr }) => {
      const node = tr.doc.nodeAt(pos)
      if (!node) return false
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...values })
      return true
    })
    .run()
}

export function removeButton(editor: Editor, pos: number) {
  const node = editor.state.doc.nodeAt(pos)
  if (node)
    editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + node.nodeSize })
      .run()
}
