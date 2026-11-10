import { useTranslation } from "@workspace/i18n/react"

import { SourceMark } from "../post-sources"

/** A figure with the study it comes from; the guard won't build one without a source. */
export function Stat({
  value,
  label,
  source,
  cite,
}: {
  value: string
  label: string
  source: string
  cite: string
}) {
  const { t } = useTranslation("blog")

  return (
    <figure className="my-2 flex flex-col gap-2 rounded-xl border p-6 print:break-inside-avoid">
      <p className="text-4xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      <p className="text-pretty">{label}</p>
      <figcaption className="text-sm text-muted-foreground">
        {t("mdx.source")}{" "}
        <a href={source} rel="noopener" className="text-link">
          {cite}
        </a>
        <SourceMark url={source} />
      </figcaption>
    </figure>
  )
}
