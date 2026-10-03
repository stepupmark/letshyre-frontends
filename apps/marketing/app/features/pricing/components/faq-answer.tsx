import { localePath } from "@workspace/i18n"
import { useLocale } from "@workspace/i18n/react"
import { Link } from "react-router"

import { splitTag } from "../lib/split-tag"

/** Answers may link the refund policy with `<refund>…</refund>`. */
export function FaqAnswer({ text }: { text: string }) {
  const lang = useLocale()
  const parts = splitTag(text, "refund")
  if (!parts) return text

  return (
    <>
      {parts.before}
      <Link to={localePath(lang, "/refund-policy")}>{parts.inner}</Link>
      {parts.after}
    </>
  )
}
