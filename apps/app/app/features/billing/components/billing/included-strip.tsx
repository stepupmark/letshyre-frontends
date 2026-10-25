import { useTranslation } from "@workspace/i18n/react"
import { Check } from "lucide-react"

export function IncludedStrip() {
  const { t } = useTranslation("billing")
  const items = [
    t("includes.contact"),
    t("includes.scorecard"),
    t("includes.recording"),
    t("includes.noExpiry"),
  ]

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-dashed px-4 py-3 md:flex-row md:items-center md:gap-6">
      <p className="text-sm font-medium">{t("includes.title")}</p>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-1.5">
            <Check className="size-4 shrink-0 text-brand" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
