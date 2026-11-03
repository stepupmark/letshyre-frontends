import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { LockOpenIcon } from "lucide-react"

import { Avatar } from "@/components/art/avatar"
import { wait } from "@/components/art/delay"
import { ScoreRing } from "@/components/art/score-ring"

import { Bar, Panel, Stage } from "../stage"

export function HeroScene() {
  const { t } = useTranslation("homeV2")
  const people = t("hero.scene.people", { returnObjects: true })

  return (
    <Stage label={t("hero.scene.label")} className="sm:pt-20 sm:pb-28">
      <Panel className="lift">
        <div className="flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-5">
          <div>
            <p className="font-semibold">{t("hero.scene.job")}</p>
            <p className="text-xs text-muted-foreground">
              {t("hero.scene.summary")}
            </p>
          </div>
        </div>
        <ol>
          {people.map((person, index) => (
            <li
              key={person.name}
              className={cn(
                "lift flex items-center gap-3 border-b px-4 py-3 last:border-0 sm:px-5",
                index === 0 && "bg-brand-muted/25"
              )}
              style={wait(150 + index * 110)}
            >
              <span className="w-4 text-sm font-medium text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <Avatar name={person.name} className="size-9 text-xs" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 truncate text-sm font-medium">
                  {person.name}
                  {index === 2 && (
                    <span className="rounded-full border px-1.5 text-xs font-normal text-muted-foreground">
                      {t("hero.scene.pool")}
                    </span>
                  )}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {person.role}
                </span>
              </span>
              <span className="hidden w-28 flex-col gap-1 sm:flex">
                <span className="text-xs text-muted-foreground">
                  {t("hero.scene.match")}
                </span>
                <Bar value={person.score} onLoad />
              </span>
              <span className="w-8 text-end text-lg font-semibold text-brand-text tabular-nums">
                {person.score}
              </span>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel
        className="lift mt-4 flex items-center gap-4 p-4 sm:absolute sm:inset-e-0 sm:-bottom-24 sm:mt-0 sm:w-80"
        style={wait(520)}
      >
        <ScoreRing score={78} caption={t("hero.scene.outOf")} compact />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {t("hero.scene.interview")}
          </p>
          <p className="text-sm font-semibold text-success">
            {t("hero.scene.strong")}
          </p>
          <p className="mt-1 text-xs text-pretty text-muted-foreground">
            {t("hero.scene.strength")}
          </p>
        </div>
      </Panel>

      <Panel
        className="lift mt-4 flex items-center gap-3 px-4 py-3 sm:absolute sm:inset-e-6 sm:-top-14 sm:mt-0 sm:w-64"
        style={wait(760)}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-text">
          <LockOpenIcon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="flex items-baseline justify-between gap-2 text-sm font-semibold">
            {t("hero.scene.unlocked")}
            <span className="text-xs font-normal text-muted-foreground tabular-nums">
              {t("hero.scene.credit")}
            </span>
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {t("hero.scene.contact")}
          </span>
        </span>
      </Panel>
    </Stage>
  )
}
