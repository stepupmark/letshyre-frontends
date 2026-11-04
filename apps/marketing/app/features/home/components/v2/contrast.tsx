import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { BadgeCheckIcon, CheckIcon, FilesIcon, XIcon } from "lucide-react"
import type { CSSProperties } from "react"

import { Band } from "@/components/band"
import { BandHeading } from "@/components/band-heading"

export function Contrast() {
  const { t } = useTranslation("homeV2")
  const rows = t("contrast.rows", { returnObjects: true })
  const before = t("contrast.before.items", { returnObjects: true })
  const after = t("contrast.after.items", { returnObjects: true })

  return (
    <Band id="contrast" tinted>
      <BandHeading
        id="contrast-title"
        eyebrow={t("contrast.eyebrow")}
        title={t("contrast.title")}
        accent={t("contrast.accent")}
        stacked
        className="slide-in max-w-3xl"
      />

      <div className="slide-in mt-14">
        <div
          aria-hidden
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,2fr)] max-md:hidden"
        >
          <span />
          <p className="flex items-center gap-2 px-6 pt-6 pb-5 text-sm font-medium text-muted-foreground">
            <FilesIcon className="size-4" />
            {t("contrast.before.title")}
          </p>
          <p className="flex items-center gap-2 rounded-t-2xl bg-brand-muted/50 px-6 pt-6 pb-5 text-sm font-medium text-brand-text">
            <BadgeCheckIcon className="size-4" />
            {t("contrast.after.title")}
          </p>
        </div>

        <ol>
          {rows.map((row, index) => (
            <li
              key={row}
              className="grid gap-3 border-t py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,2fr)] md:gap-0 md:py-0"
            >
              <h3 className="font-medium md:py-7 md:pe-6">{row}</h3>
              <p className="flex gap-3 text-pretty text-muted-foreground md:px-6 md:py-7">
                <XIcon aria-hidden className="mt-1 size-4 shrink-0" />
                <span>
                  <span className="sr-only">{t("contrast.before.title")} </span>
                  {before[index]}
                </span>
              </p>
              <p
                className={cn(
                  "drop-in flex gap-3 rounded-xl bg-brand-muted/50 p-4 text-pretty md:rounded-none md:px-6 md:py-7",
                  index === rows.length - 1 && "md:rounded-b-2xl"
                )}
                style={{ "--i": index } as CSSProperties}
              >
                <CheckIcon
                  aria-hidden
                  className="mt-1 size-4 shrink-0 text-brand-text"
                />
                <span>
                  <span className="sr-only">{t("contrast.after.title")} </span>
                  {after[index]}
                </span>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Band>
  )
}
