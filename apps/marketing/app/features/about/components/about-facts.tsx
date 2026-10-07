import { useTranslation } from "@workspace/i18n/react"
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

  return (
    <ul
      aria-label={t("facts.label")}
      className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium"
    >
      {FACTS.map(({ id, icon: Icon }) => (
        <li key={id} className="flex items-center gap-2">
          <Icon aria-hidden className="size-4 shrink-0 text-brand" />
          {t(`facts.${id}`)}
        </li>
      ))}
    </ul>
  )
}
