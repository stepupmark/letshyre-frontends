import { useTranslation } from "@workspace/i18n/react"
import { CheckIcon, XIcon } from "lucide-react"

export function Compare({ avoid, prefer }: { avoid: string; prefer: string }) {
  const { t } = useTranslation("blog")

  return (
    <div className="my-2 grid gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-2 rounded-xl border p-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-destructive">
          <XIcon aria-hidden className="size-4" />
          {t("mdx.avoid")}
        </p>
        <p className="text-pretty">{avoid}</p>
      </div>
      <div className="flex flex-col gap-2 rounded-xl border bg-muted/40 p-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-success">
          <CheckIcon aria-hidden className="size-4" />
          {t("mdx.prefer")}
        </p>
        <p className="text-pretty text-foreground">{prefer}</p>
      </div>
    </div>
  )
}
