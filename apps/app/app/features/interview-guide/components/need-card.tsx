import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Camera,
  Download,
  Lamp,
  Mic,
  MonitorUp,
  Smartphone,
} from "lucide-react"
import { useId } from "react"

import { buttonLink } from "@/lib/button-link"
import { sitePage } from "@/lib/site"

const NEEDS = [
  ["camera", Camera],
  ["mic", Mic],
  ["screen", MonitorUp],
  ["room", Lamp],
] as const

const osName = () => {
  const agent = typeof navigator === "undefined" ? "" : navigator.userAgent
  if (/Android|iPhone|iPad/.test(agent)) return null
  if (agent.includes("Mac")) return "macOS"
  if (agent.includes("Win")) return "Windows"
  return null
}

/** What to have ready, and the download. */
export function NeedCard() {
  const { t } = useTranslation("guide")
  const locale = useLocale()
  const id = useId()
  const os = osName()

  return (
    <aside
      aria-labelledby={id}
      className="flex flex-col gap-4 rounded-xl border bg-card p-4"
    >
      <h2 id={id} className="text-sm font-semibold">
        {t("needTitle")}
      </h2>
      <ul className="grid grid-cols-2 gap-2">
        {NEEDS.map(([key, Icon]) => (
          <li
            key={key}
            className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-2 text-xs font-medium"
          >
            <Icon
              className="size-3.5 shrink-0 text-brand-text"
              aria-hidden="true"
            />
            {t(`needs.${key}`)}
          </li>
        ))}
      </ul>
      <p className="hidden items-start gap-2 rounded-lg bg-brand-muted/60 px-3 py-2 text-xs text-brand-text pointer-coarse:flex">
        <Smartphone className="mt-px size-3.5 shrink-0" aria-hidden="true" />
        {t("mobileNote")}
      </p>
      <div className="flex flex-col gap-1.5">
        <a
          href={sitePage(locale, "/download")}
          aria-describedby={`${id}-site`}
          className={buttonLink({ className: "w-full" })}
        >
          <Download />
          {os ? t("cta.forOs", { os }) : t("cta.button")}
        </a>
        <p
          id={`${id}-site`}
          className="text-center text-xs text-muted-foreground"
        >
          {t("cta.body")}
        </p>
      </div>
    </aside>
  )
}
