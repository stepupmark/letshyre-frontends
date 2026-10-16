import { useTranslation } from "@workspace/i18n/react"
import { CheckIcon } from "lucide-react"

import { REQUIREMENTS_ANCHOR } from "../lib/chapters"

export function DayRequirements() {
  const { t } = useTranslation("candidateGuide")
  const items = t("requirements.items", { returnObjects: true })

  return (
    <div
      id={REQUIREMENTS_ANCHOR}
      className="mt-10 flex scroll-mt-24 flex-col gap-4 rounded-2xl border p-5 sm:p-6"
    >
      <h3 className="text-lg font-semibold tracking-tight text-brand-text">
        {t("requirements.title")}
      </h3>
      <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
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
}
