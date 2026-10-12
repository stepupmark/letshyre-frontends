import { LOCALES } from "@workspace/i18n"
import { useFormat, useTranslation } from "@workspace/i18n/react"
import {
  CalendarClockIcon,
  LanguagesIcon,
  LockOpenIcon,
  VideoIcon,
} from "lucide-react"

const FACTS = [
  { id: "aiInterviews", icon: VideoIcon },
  { id: "payPerUnlock", icon: LockOpenIcon },
  { id: "activeProfiles", icon: CalendarClockIcon },
  { id: "languages", icon: LanguagesIcon },
] as const

export function AboutFacts() {
  const { t } = useTranslation("about")
  const format = useFormat()

  return (
    <ul
      aria-label={t("facts.label")}
      className="mt-1 grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2 sm:max-lg:max-w-lg"
    >
      {FACTS.map(({ id, icon: Icon }) => (
        <li key={id} className="flex items-center gap-2.5">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-muted text-brand-text">
            <Icon aria-hidden className="size-4" />
          </span>
          {t(`facts.${id}`, { total: format.number(LOCALES.length) })}
        </li>
      ))}
    </ul>
  )
}
