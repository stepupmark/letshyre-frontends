import { EditorContent, useEditor } from "@tiptap/react"
import { useState } from "react"

import { useFieldMenu } from "../../hooks/use-field-menu"
import { useSyncedEditor } from "../../hooks/use-synced-editor"
import {
  applyLink,
  buttonAt,
  linkAt,
  removeButton,
  removeLink,
  saveButton,
} from "../../lib/editor/commands"
import { bodyExtensions } from "../../lib/editor/extensions"
import { cleanPastedHtml } from "../../lib/paste"
import { fromEditorHtml, sameHtml, toEditorHtml } from "../../lib/template-html"
import { ButtonDialog } from "./button-dialog"
import { EditorToolbar } from "./editor-toolbar"
import { FieldMenu } from "./field-menu"
import { LinkDialog } from "./link-dialog"

type Dialog = { kind: "link" } | { kind: "button"; pos: number | null } | null

export function BodyEditor({
  initial,
  editable,
  labelOf,
  placeholder,
  editLabel,
  labelledBy,
  describedBy,
  invalid,
  onChange,
  onFidelity,
}: {
  initial: string
  editable: boolean
  labelOf: (key: string) => string | null
  placeholder: string
  editLabel: string
  labelledBy: string
  describedBy?: string
  invalid: boolean
  onChange: (html: string) => void
  onFidelity: (exact: boolean) => void
}) {
  const [dialog, setDialog] = useState<Dialog>(null)
  const { bridge, menu } = useFieldMenu()
  const editor = useEditor(
    {
      extensions: bodyExtensions({
        labelOf,
        placeholder,
        editLabel,
        onEditButton: (pos) => {
          setDialog({ kind: "button", pos })
        },
        fieldMenu: bridge,
      }),
      content: toEditorHtml(initial),
      editable,
      injectCSS: false,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: {
          role: "textbox",
          "aria-multiline": "true",
          "aria-labelledby": labelledBy,
          dir: "auto",
        },
        transformPastedHTML: cleanPastedHtml,
        handleKeyDown: (_, event) => {
          if (
            event.key.toLowerCase() !== "k" ||
            !(event.metaKey || event.ctrlKey)
          )
            return false
          event.preventDefault()
          setDialog({ kind: "link" })
          return true
        },
      },
      onCreate: ({ editor: current }) => {
        onFidelity(sameHtml(fromEditorHtml(current.getHTML()), initial))
      },
      onUpdate: ({ editor: current }) => {
        onChange(fromEditorHtml(current.getHTML()))
      },
    },
    []
  )
  useSyncedEditor(editor, { editable, invalid, describedBy })
  const buttonPos = dialog?.kind === "button" ? dialog.pos : null

  return (
    <>
      {editable && (
        <EditorToolbar
          editor={editor}
          labelOf={labelOf}
          onLink={() => {
            setDialog({ kind: "link" })
          }}
          onButton={() => {
            setDialog({ kind: "button", pos: null })
          }}
        />
      )}
      <EditorContent
        editor={editor}
        className="**:data-fresh:pop **:data-email-button:mx-auto **:data-email-button:my-4 **:data-email-button:w-fit **:data-email-button:rounded-md **:data-merge:rounded-sm **:data-merge:bg-brand-muted **:data-merge:px-1.5 **:data-merge:py-0.5 **:data-merge:text-xs **:data-merge:font-medium **:data-merge:text-brand-text **:data-merge:no-underline **:data-merge:select-none **:data-[known=false]:bg-danger-muted **:data-[known=false]:text-danger **:data-[tone=dark]:bg-foreground **:data-[tone=dark]:text-background **:data-[tone=primary]:bg-primary **:data-[tone=primary]:text-primary-foreground [&_.ProseMirror-selectednode]:rounded-md [&_.ProseMirror-selectednode]:ring-2 [&_.ProseMirror-selectednode]:ring-ring [&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-start [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-muted-foreground [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.tiptap]:min-h-80 [&_.tiptap]:px-4 [&_.tiptap]:py-3 [&_.tiptap]:text-sm [&_.tiptap]:text-pretty [&_.tiptap]:outline-none [&_.tiptap]:aria-readonly:bg-muted/30 [&_.tiptap>*:first-child]:mt-0 [&_[data-email-button]_button]:inline-flex [&_[data-email-button]_button]:min-h-9 [&_[data-email-button]_button]:items-center [&_[data-email-button]_button]:rounded-md [&_[data-email-button]_button]:px-5 [&_[data-email-button]_button]:text-sm [&_[data-email-button]_button]:font-semibold [&_[data-email-button]_button]:transition-transform [&_[data-email-button]_button]:hover:-translate-y-px [&_[data-email-button]_button]:focus-visible:ring-3 [&_[data-email-button]_button]:focus-visible:ring-ring/50 [&_[data-email-button]_button]:focus-visible:outline-none [&_[data-email-button]_button]:motion-reduce:transition-none [&_a]:text-primary [&_a]:underline [&_blockquote]:border-s-2 [&_blockquote]:ps-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:ps-5"
      />
      <FieldMenu menu={menu} labelOf={labelOf} />
      {dialog?.kind === "link" && (
        <LinkDialog
          initial={linkAt(editor)}
          onClose={() => {
            setDialog(null)
          }}
          onRemove={() => {
            removeLink(editor)
            setDialog(null)
          }}
          onSave={(href) => {
            applyLink(editor, href)
            setDialog(null)
          }}
        />
      )}
      {dialog?.kind === "button" && (
        <ButtonDialog
          initial={buttonAt(editor, buttonPos)}
          onClose={() => {
            setDialog(null)
          }}
          onRemove={() => {
            if (buttonPos !== null) removeButton(editor, buttonPos)
            setDialog(null)
          }}
          onSave={(values) => {
            saveButton(editor, buttonPos, values)
            setDialog(null)
          }}
        />
      )}
    </>
  )
}
