import { EditorContent, useEditor, type JSONContent } from "@tiptap/react"

import { subjectExtensions } from "../../lib/editor/extensions"
import { useSyncedEditor } from "../../hooks/use-synced-editor"
import { piecesOf } from "../../lib/merge-fields"

const docOf = (subject: string): JSONContent => ({
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: piecesOf(subject).flatMap((piece): JSONContent[] => {
        if ("field" in piece)
          return [{ type: "mergeField", attrs: { key: piece.field } }]
        return piece.text ? [{ type: "text", text: piece.text }] : []
      }),
    },
  ],
})

export function SubjectEditor({
  initial,
  editable,
  labelOf,
  placeholder,
  labelledBy,
  describedBy,
  invalid,
  onChange,
}: {
  initial: string
  editable: boolean
  labelOf: (key: string) => string | null
  placeholder: string
  labelledBy: string
  describedBy?: string
  invalid: boolean
  onChange: (subject: string) => void
}) {
  const editor = useEditor(
    {
      extensions: subjectExtensions({ labelOf, placeholder }),
      content: docOf(initial),
      editable,
      injectCSS: false,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: {
          role: "textbox",
          "aria-multiline": "false",
          "aria-labelledby": labelledBy,
        },
        transformPastedText: (text) => text.replace(/\s*\n+\s*/g, " "),
      },
      onUpdate: ({ editor: current }) => {
        onChange(current.getText())
      },
    },
    []
  )
  useSyncedEditor(editor, { editable, invalid, describedBy })
  return (
    <EditorContent
      editor={editor}
      className="**:data-merge:rounded-sm **:data-merge:bg-brand-muted **:data-merge:px-1.5 **:data-merge:py-0.5 **:data-merge:text-xs **:data-merge:font-medium **:data-merge:text-brand-text **:data-merge:select-none **:data-[known=false]:bg-danger-muted **:data-[known=false]:text-danger [&_.ProseMirror-selectednode]:ring-2 [&_.ProseMirror-selectednode]:ring-ring [&_.is-editor-empty]:before:pointer-events-none [&_.is-editor-empty]:before:float-start [&_.is-editor-empty]:before:h-0 [&_.is-editor-empty]:before:text-muted-foreground [&_.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.tiptap]:min-h-9 [&_.tiptap]:w-full [&_.tiptap]:rounded-lg [&_.tiptap]:border [&_.tiptap]:border-input [&_.tiptap]:px-2.5 [&_.tiptap]:py-1.5 [&_.tiptap]:text-sm [&_.tiptap]:transition-colors [&_.tiptap]:outline-none [&_.tiptap]:focus-visible:border-ring [&_.tiptap]:focus-visible:ring-3 [&_.tiptap]:focus-visible:ring-ring/50 [&_.tiptap]:aria-invalid:border-destructive [&_.tiptap]:aria-invalid:ring-3 [&_.tiptap]:aria-invalid:ring-destructive/20 [&_.tiptap]:aria-readonly:bg-muted/50"
    />
  )
}
