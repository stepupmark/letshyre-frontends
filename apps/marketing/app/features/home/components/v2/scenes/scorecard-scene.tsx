import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { PlayIcon, SearchIcon } from "lucide-react"

import { ScoreRing } from "@/components/art/score-ring"

import { Bar, Panel, Stage } from "../stage"

const QUESTIONS = 8
const CURRENT = 4

export function ScorecardScene() {
  const { t } = useTranslation("homeV2")
  const skills = t("evidence.scene.skills", { returnObjects: true })

  return (
    <Stage label={t("evidence.scene.label")}>
      <Panel className="p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <ScoreRing score={78} caption={t("evidence.scene.outOf")} compact />
          <div>
            <p className="font-semibold">{t("evidence.scene.title")}</p>
            <p className="mt-1 inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              {t("evidence.scene.strong")}
            </p>
          </div>
        </div>

        <ul className="mt-5 flex flex-col gap-3">
          {skills.map((skill) => (
            <li key={skill.name} className="grid gap-1.5">
              <span className="flex justify-between text-sm">
                <span className="text-muted-foreground">{skill.name}</span>
                <span className="font-semibold tabular-nums">
                  {skill.value}
                </span>
              </span>
              <Bar value={skill.value} />
            </li>
          ))}
        </ul>

        <div className="mt-5 flex gap-3 rounded-lg border p-3">
          <SearchIcon className="mt-0.5 size-4 shrink-0 text-brand-text" />
          <p className="text-sm">
            <span className="block text-xs text-muted-foreground">
              {t("evidence.scene.probe")}
            </span>
            {t("evidence.scene.probeText")}
          </p>
        </div>
      </Panel>

      <Panel className="drop-in mt-3 flex items-center gap-3 p-3 sm:mx-8">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <PlayIcon className="size-4 fill-current rtl:-scale-x-100" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex justify-between text-xs text-muted-foreground">
            <span>{t("evidence.scene.question")}</span>
            <span className="tabular-nums">{t("evidence.scene.duration")}</span>
          </span>
          <span className="mt-2 flex gap-1">
            {Array.from({ length: QUESTIONS }, (_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  index < CURRENT
                    ? "bg-brand"
                    : index === CURRENT
                      ? "bg-brand/40"
                      : "bg-muted"
                )}
              />
            ))}
          </span>
        </span>
      </Panel>
    </Stage>
  )
}
