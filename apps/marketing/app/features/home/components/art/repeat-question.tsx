import { useTranslation } from "@workspace/i18n/react"
import { RepeatIcon } from "lucide-react"

import { wait } from "@/components/art/delay"

const COMPANIES = ["A", "B", "C", "D"]

/** The same opening question from four companies in four days. */
export default function RepeatQuestion() {
  const { t } = useTranslation("home")
  const days = t("tension.scene.days", { returnObjects: true })

  return (
    <div aria-hidden className="flex h-full flex-col justify-between gap-4">
      <ol className="flex flex-col gap-1.5">
        {COMPANIES.map((company, index) => (
          <li
            key={company}
            className="pop-in flex items-center gap-2"
            style={{ ...wait(index * 80), paddingInlineStart: index * 10 }}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-card text-xs font-semibold text-muted-foreground">
              {company}
            </span>
            <q className="truncate rounded-xl rounded-ss-sm border bg-card px-2.5 py-1 text-xs italic">
              {t("tension.scene.question")}
            </q>
            <span className="ms-auto shrink-0 text-xs text-muted-foreground">
              {days[index]}
            </span>
          </li>
        ))}
      </ol>
      <p className="flex items-center justify-end gap-1.5 text-xs font-medium">
        <RepeatIcon className="size-3.5 text-brand-text" />
        {t("tension.scene.asked")}
      </p>
    </div>
  )
}
