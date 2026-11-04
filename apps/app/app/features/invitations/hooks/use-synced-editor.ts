import type { Editor } from "@tiptap/react"
import { useEffect } from "react"

/** Keeps a live editor in step with props, without rebuilding it and losing the text. */
export function useSyncedEditor(
  editor: Editor | null,
  {
    editable,
    invalid,
    describedBy,
  }: { editable: boolean; invalid: boolean; describedBy?: string }
) {
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    editor.setEditable(editable, false)
    const { editorProps } = editor.options
    const attributes =
      typeof editorProps.attributes === "object" ? editorProps.attributes : {}
    editor.setOptions({
      editorProps: {
        ...editorProps,
        attributes: {
          ...attributes,
          "aria-invalid": String(invalid),
          "aria-readonly": String(!editable),
          "aria-describedby": describedBy ?? "",
        },
      },
    })
  }, [editor, editable, invalid, describedBy])
}
