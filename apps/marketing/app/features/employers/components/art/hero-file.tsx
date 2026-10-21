import { useTranslation } from "@workspace/i18n/react"
import { FileSearchIcon, LockOpenIcon, AudioLinesIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Avatar } from "@/components/art/avatar"
import { Meter } from "@/components/art/meter"
import { ScoreRing } from "@/components/art/score-ring"

const WAVE = [6, 14, 22, 12, 26, 18, 9, 20, 28, 15, 8, 18, 24, 11, 6]

function Stage({
  icon,
  delay,
  children,
}: {
  icon: ReactNode
  delay: number
  children: ReactNode
}) {
  return (
    <li
      className="rise relative flex gap-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full border bg-background text-brand-text [&_svg]:size-4">
        {icon}
      </span>
      <div className="min-w-0 flex-1 rounded-xl border bg-muted/40 p-4">
        {children}
      </div>
    </li>
  )
}

/** A candidate file filling in: resume analysis, then the interview, then the score. */
export function HeroFile() {
  const { t } = useTranslation("employers")
  const name = t("hero.file.name")

  return (
    <figure aria-hidden className="relative mx-auto w-full max-w-md lg:me-0">
      <div className="relative">
        <div className="rounded-3xl border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Avatar name={name} />
            <div className="min-w-0">
              <p className="font-semibold">{name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {t("hero.file.role")}
              </p>
            </div>
          </div>

          <ol className="relative mt-6 flex flex-col gap-3 before:absolute before:inset-y-4 before:inset-s-4.5 before:w-px before:bg-border">
            <Stage icon={<FileSearchIcon />} delay={150}>
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                {t("hero.file.resume")}
              </p>
              <Meter
                label={t("hero.file.jobMatch")}
                value={92}
                text="92%"
                animate
              />
            </Stage>

            <Stage icon={<AudioLinesIcon />} delay={450}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("hero.file.interview")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("hero.file.questions")}
                </p>
              </div>
              <svg viewBox="0 0 150 32" className="mt-3 h-8 w-full">
                {WAVE.map((height, i) => (
                  <rect
                    key={i}
                    x={i * 10 + 2}
                    y={(32 - height) / 2}
                    width={5}
                    height={height}
                    rx={2.5}
                    className={
                      i < 9
                        ? "level fill-brand"
                        : "level fill-muted-foreground/30"
                    }
                    style={{ animationDelay: `${i * 60}ms` }}
                  />
                ))}
              </svg>
            </Stage>

            <Stage
              icon={<span className="size-2 rounded-full bg-brand" />}
              delay={750}
            >
              <div className="flex items-center gap-4">
                <ScoreRing score={84} caption={t("hero.file.outOf")} compact />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("hero.file.score")}
                  </p>
                  <p className="mt-1.5 inline-flex rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                    {t("hero.file.band")}
                  </p>
                </div>
              </div>
            </Stage>
          </ol>
        </div>

        <span
          className="pop absolute inset-e-4 -bottom-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground sm:-inset-e-5"
          style={{ animationDelay: `1300ms` }}
        >
          <LockOpenIcon className="size-3.5" />
          {t("hero.file.ready")}
        </span>
      </div>
      <figcaption className="mt-14 text-center text-xs text-muted-foreground">
        {t("hero.file.caption")}
      </figcaption>
    </figure>
  )
}
