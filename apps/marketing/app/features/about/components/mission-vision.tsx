import { useTranslation } from "@workspace/i18n/react"
import { EyeIcon, TargetIcon } from "lucide-react"
import { useId } from "react"

const ITEMS = [
  { key: "mission", icon: TargetIcon },
  { key: "vision", icon: EyeIcon },
] as const

export function MissionVision() {
  const { t } = useTranslation("about")
  const id = useId()

  return (
    <div className="flex flex-col gap-4">
      {ITEMS.map(({ key, icon: Icon }) => (
        <section
          key={key}
          aria-labelledby={`${id}-${key}`}
          className="flex flex-col gap-2 rounded-xl border p-5 sm:p-6"
        >
          <h3
            id={`${id}-${key}`}
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <Icon aria-hidden className="size-5 text-brand" />
            {t(`${key}.title`)}
          </h3>
          <p className="text-pretty text-muted-foreground">
            {t(`${key}.desc`)}
          </p>
        </section>
      ))}
    </div>
  )
}
