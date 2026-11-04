import { useTranslation } from "@workspace/i18n/react"

import { isMergeField, piecesOf } from "../../lib/merge-fields"

export function FieldToken({ field }: { field: string }) {
  const { t } = useTranslation("invitations")
  const known = isMergeField(field)
  return (
    <span
      data-known={known}
      className="inline-flex items-center rounded-sm bg-brand-muted px-1.5 py-0.5 text-xs font-medium text-brand-text data-[known=false]:bg-danger-muted data-[known=false]:text-danger"
    >
      {known ? t(`fields.${field}`) : `{{${field}}}`}
    </span>
  )
}

/** A subject line with its merge fields drawn as tokens. */
export function TokenText({ text }: { text: string }) {
  return piecesOf(text).map((piece, i) =>
    "field" in piece ? (
      <FieldToken key={i} field={piece.field} />
    ) : (
      <span key={i}>{piece.text}</span>
    )
  )
}
