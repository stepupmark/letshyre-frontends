import { useTranslation } from "@workspace/i18n/react"
import { CheckIcon, FileTextIcon } from "lucide-react"

import { JD_ANCHOR } from "../lib/chapters"

const GROUPS = ["role", "person", "place", "work"] as const

export function JdChecklist() {
  const { t } = useTranslation("employerGuide")

  return (
    <div
      id={JD_ANCHOR}
      className="mt-10 grid scroll-mt-24 gap-6 rounded-2xl border p-5 sm:p-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-8"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight text-balance text-brand-text">
          {t("jd.title")}
        </h3>
        <p className="text-sm text-pretty text-muted-foreground">
          {t("jd.lead")}
        </p>
        <p className="mt-2 text-sm text-pretty">{t("jd.tip")}</p>
      </div>

      <div className="reveal overflow-hidden rounded-xl border bg-background">
        <p className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5 font-mono text-xs text-muted-foreground">
          <FileTextIcon aria-hidden className="size-4 text-brand-text" />
          {t("jd.file")}
        </p>
        <div className="grid gap-6 p-4 sm:grid-cols-2 sm:p-5">
          {GROUPS.map((group) => {
            const items = t(`jd.groups.${group}.items`, {
              returnObjects: true,
            })
            return (
              <div key={group} className="flex flex-col gap-2.5">
                <h4 className="text-xs font-medium text-muted-foreground">
                  {t(`jd.groups.${group}.title`)}
                </h4>
                <ul className="flex flex-col gap-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <span
                        aria-hidden
                        className="pop-in mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                      >
                        <CheckIcon className="size-2.5" strokeWidth={3.5} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
