import { useTranslation } from "@workspace/i18n/react"
import { ShieldCheckIcon } from "lucide-react"
import { useId } from "react"

export function Disclaimer() {
  const { t } = useTranslation("about")
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className="mt-10 flex gap-3 rounded-xl border bg-muted/40 p-5 sm:p-6"
    >
      <ShieldCheckIcon
        aria-hidden
        className="mt-0.5 size-5 shrink-0 text-brand"
      />
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="font-semibold">
          {t("disclaimer.title")}
        </h2>
        <p className="max-w-3xl text-sm text-pretty text-muted-foreground">
          {t("disclaimer.body")}
        </p>
      </div>
    </section>
  )
}
