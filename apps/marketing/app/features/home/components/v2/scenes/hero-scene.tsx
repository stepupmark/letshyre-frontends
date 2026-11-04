import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronRightIcon, LockIcon, LockOpenIcon } from "lucide-react"

import { Avatar } from "@/components/art/avatar"
import { wait } from "@/components/art/delay"

import { Photo } from "../photo"

export function HeroScene() {
  const { t } = useTranslation("homeV2")
  const people = t("hero.scene.people", { returnObjects: true })

  return (
    <div
      className="lift rounded-3xl border bg-muted/50 p-2 sm:p-3"
      style={wait(240)}
    >
      <div className="grid gap-2 sm:gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
        <div className="relative max-lg:hidden">
          <Photo
            name="hiring-manager"
            alt={t("hero.photo")}
            sizes="(min-width: 1152px) 420px, 36vw"
            priority
            className="absolute inset-0 aspect-auto"
          />
        </div>

        <div
          role="img"
          aria-label={t("hero.scene.label")}
          className="overflow-hidden rounded-2xl border bg-card text-start"
        >
          <div
            aria-hidden
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b px-4 py-3.5 sm:px-5"
          >
            <p className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">
                {t("hero.scene.jobs")}
              </span>
              <ChevronRightIcon className="size-3.5 text-muted-foreground rtl:-scale-x-100" />
              <span className="font-semibold tracking-tight sm:text-base">
                {t("hero.scene.job")}
              </span>
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {t("hero.scene.summary")}
            </p>
          </div>

          <div aria-hidden>
            <p className="grid grid-cols-[minmax(0,1fr)_3.5rem_4rem] gap-2 border-b bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground sm:grid-cols-[minmax(0,1fr)_8rem_5rem_6rem] sm:gap-3 sm:px-5">
              <span>{t("hero.scene.columns.candidate")}</span>
              <span>{t("hero.scene.columns.match")}</span>
              <span>{t("hero.scene.columns.interview")}</span>
              <span className="max-sm:hidden">
                {t("hero.scene.columns.file")}
              </span>
            </p>
            <ol>
              {people.map((person, index) => (
                <li
                  key={person.name}
                  className={cn(
                    "lift grid grid-cols-[minmax(0,1fr)_3.5rem_4rem] items-center gap-2 border-b px-4 py-3.5 last:border-0 sm:grid-cols-[minmax(0,1fr)_8rem_5rem_6rem] sm:gap-3 sm:px-5",
                    index === 0 && "bg-brand-muted/30"
                  )}
                  style={wait(360 + index * 90)}
                >
                  <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    <span className="w-3 text-xs font-medium text-muted-foreground tabular-nums max-sm:hidden">
                      {index + 1}
                    </span>
                    <Avatar name={person.name} className="size-8 text-xs" />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                        <span className="truncate">{person.name}</span>
                        {person.pool && (
                          <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tracking-normal text-muted-foreground max-sm:hidden lg:max-xl:hidden">
                            {t("hero.scene.pool")}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {person.role}
                        <span className="max-sm:hidden lg:max-xl:hidden">
                          {t("hero.scene.separator")}
                          {person.years}
                        </span>
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-6 text-sm font-semibold text-brand-text tabular-nums">
                      {person.match}
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted max-sm:hidden">
                      <span
                        className="bar-in block h-full rounded-full bg-brand"
                        style={{
                          width: `${String(person.match)}%`,
                          ...wait(500 + index * 90),
                        }}
                      />
                    </span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {person.interview}
                    <span className="text-xs font-normal text-muted-foreground">
                      {t("hero.scene.outOf")}
                    </span>
                  </span>
                  <span className="max-sm:hidden">
                    {person.unlocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand-text">
                        <LockOpenIcon className="size-3" />
                        {t("hero.scene.unlocked")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <LockIcon className="size-3" />
                        {t("hero.scene.credit")}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
