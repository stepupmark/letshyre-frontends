import { useLocale } from "@workspace/i18n/react"

import { sitePage } from "@/lib/site"

import { splitTag } from "../lib/split-tag"

/** Answers may link the refund policy with `<refund>…</refund>`. */
export function FaqAnswer({ text }: { text: string }) {
  const locale = useLocale()
  const parts = splitTag(text, "refund")
  if (!parts) return text

  return (
    <>
      {parts.before}
      <a href={sitePage(locale, "/refund-policy")}>{parts.inner}</a>
      {parts.after}
    </>
  )
}
