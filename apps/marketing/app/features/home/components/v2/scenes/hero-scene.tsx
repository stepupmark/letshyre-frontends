import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"

import { Avatar } from "@/components/art/avatar"
import { wait } from "@/components/art/delay"
import { ScoreRing } from "@/components/art/score-ring"

import { Photo } from "../photo"
import { Panel } from "../stage"

export function HeroScene() {
  const { t } = useTranslation("homeV2")
  const people = t("hero.scene.people", { returnObjects: true })

  return (
    <div className="relative">
      <Photo
        name="hiring-manager"
        alt={t("hero.photo")}
        sizes="(min-width: 1152px) 600px, (min-width: 1024px) 52vw, calc(100vw - 2rem)"
        priority
      />

      <div
        role="img"
        aria-label={t("hero.scene.label")}
        className="relative -mt-16 px-4 sm:absolute sm:inset-0 sm:mt-0 sm:px-0"
      >
        <Panel
          aria-hidden
          className="lift sm:absolute sm:-inset-s-4 sm:top-6 sm:w-80 lg:-inset-s-8"
          style={wait(150)}
        >
          <div className="border-b px-4 py-3">
            <p className="font-semibold">{t("hero.scene.job")}</p>
            <p className="text-xs text-muted-foreground">
              {t("hero.scene.summary")}
            </p>
          </div>
          <ol>
            {people.map((person, index) => (
              <li
                key={person.name}
                className={cn(
                  "lift flex items-center gap-3 border-b px-4 py-2.5 last:border-0",
                  index === 0 && "bg-brand-muted/25"
                )}
                style={wait(250 + index * 110)}
              >
                <span className="w-3 text-sm font-medium text-muted-foreground tabular-nums">
                  {index + 1}
                </span>
                <Avatar name={person.name} className="size-8 text-xs" />
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
                <span className="text-end text-lg font-semibold text-brand-text tabular-nums">
                  {person.score}
                </span>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel
          aria-hidden
          className="lift mt-3 flex items-center gap-4 p-4 sm:absolute sm:inset-e-4 sm:-bottom-10 sm:mt-0 sm:w-80"
          style={wait(600)}
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
      </div>
    </div>
  )
}
