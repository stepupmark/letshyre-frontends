import { Node } from "@tiptap/react"
import { CharacterCount, Placeholder } from "@tiptap/extensions"
import { StarterKit } from "@tiptap/starter-kit"

import { BODY_LIMIT, SUBJECT_LIMIT } from "../limits"
import { Callout } from "./callout"
import { EmailButton, type EmailButtonOptions } from "./email-button"
import { MergeField, type MergeFieldOptions } from "./merge-field"
import { PreserveStyle } from "./preserve-style"

const allowedHref = (url: string) =>
  url === "{{invite_link}}" || /^(https?:\/\/|mailto:)/i.test(url)

export const bodyExtensions = ({
  labelOf,
  placeholder,
  onEditButton,
  editLabel,
}: MergeFieldOptions & {
  placeholder: string
  onEditButton: EmailButtonOptions["onEdit"]
  editLabel: string
}) => [
  StarterKit.configure({
    code: false,
    codeBlock: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      HTMLAttributes: { target: null, rel: null, class: null },
      isAllowedUri: allowedHref,
    },
  }),
  PreserveStyle,
  Callout,
  EmailButton.configure({ onEdit: onEditButton, editLabel }),
  MergeField.configure({ labelOf }),
  Placeholder.configure({ placeholder }),
  CharacterCount.configure({ limit: BODY_LIMIT }),
]

const SubjectDoc = Node.create({
  name: "doc",
  topNode: true,
  content: "paragraph",
})

export const subjectExtensions = ({
  labelOf,
  placeholder,
}: MergeFieldOptions & { placeholder: string }) => [
  StarterKit.configure({
    document: false,
    blockquote: false,
    bold: false,
    bulletList: false,
    code: false,
    codeBlock: false,
    dropcursor: false,
    gapcursor: false,
    hardBreak: false,
    heading: false,
    horizontalRule: false,
    italic: false,
    link: false,
    listItem: false,
    listKeymap: false,
    orderedList: false,
    strike: false,
    trailingNode: false,
    underline: false,
  }),
  SubjectDoc,
  MergeField.configure({ labelOf }),
  Placeholder.configure({ placeholder }),
  CharacterCount.configure({ limit: SUBJECT_LIMIT }),
]
