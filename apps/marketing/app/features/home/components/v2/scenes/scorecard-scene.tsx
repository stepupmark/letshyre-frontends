import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon, PlayIcon, SearchIcon } from "lucide-react"
import type { CSSProperties, ReactNode } from "react"

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
          <div className="min-w-0">
            <p className="font-semibold">{t("evidence.scene.title")}</p>
            <p className="truncate text-xs text-muted-foreground">
              {t("evidence.scene.candidate")}
            </p>
            <p className="mt-1.5 inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
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

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Note
            index={0}
            icon={<CheckIcon className="size-3" />}
            tone="success"
            label={t("evidence.scene.strength")}
            text={t("evidence.scene.strengthText")}
          />
          <Note
            index={1}
            icon={<SearchIcon className="size-3" />}
            label={t("evidence.scene.probe")}
            text={t("evidence.scene.probeText")}
          />
        </div>
      </Panel>

      <Panel
        className="drop-in mt-3 p-4 sm:mx-6"
        style={{ "--i": 2 } as CSSProperties}
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <PlayIcon className="size-4 fill-current rtl:-scale-x-100" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex justify-between text-xs text-muted-foreground">
              <span>{t("evidence.scene.question")}</span>
              <span className="tabular-nums">
                {t("evidence.scene.duration")}
              </span>
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
        </div>
        <p className="mt-3 border-t pt-3 text-sm text-pretty">
          {t("evidence.scene.answer")}
        </p>
      </Panel>
    </Stage>
  )
}

function Note({
  index,
  icon,
  tone,
  label,
  text,
}: {
  index: number
  icon: ReactNode
  tone?: "success"
  label: string
  text: string
}) {
  return (
    <div
      className="drop-in flex gap-2.5 rounded-lg border p-3"
      style={{ "--i": index } as CSSProperties}
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
          tone === "success"
            ? "bg-success/10 text-success"
            : "bg-brand-muted text-brand-text"
        )}
      >
        {icon}
      </span>
      <p className="text-sm text-pretty">
        <span className="block text-xs text-muted-foreground">{label}</span>
        {text}
      </p>
    </div>
  )
}
