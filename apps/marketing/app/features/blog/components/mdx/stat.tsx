import { useTranslation } from "@workspace/i18n/react"

/**
 * A figure with the study it comes from; the guard won't build one without a source. The cite is
 * the link, so it skips the source number: beside it, two small targets crowd each other.
 */
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
      <figcaption className="flex flex-col gap-0.5 text-sm text-muted-foreground">
        <span className="text-xs">{t("mdx.source")}</span>
        <a href={source} rel="noopener" className="text-link self-start">
          {cite}
        </a>
      </figcaption>
    </figure>
  )
}
