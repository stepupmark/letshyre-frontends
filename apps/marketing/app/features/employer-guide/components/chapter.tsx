import { Trans, useTranslation } from "@workspace/i18n/react"
import { LightbulbIcon } from "lucide-react"
import type { ReactNode } from "react"

import { useGuideLinks } from "../hooks/use-guide-links"
import {
  CHAPTER_ANCHORS,
  CHAPTER_STEPS,
  CHAPTERS,
  type ChapterId,
} from "../lib/chapters"
import { Scene } from "./art/scene"

type StepId = (typeof CHAPTER_STEPS)[ChapterId][number]

export function Chapter({
  id,
  children,
}: {
  id: ChapterId
  children?: ReactNode
}) {
  const { t } = useTranslation("employerGuide")
  const links = useGuideLinks()
  const anchor = CHAPTER_ANCHORS[id]
  const number = CHAPTERS.indexOf(id) + 1
  const steps: readonly StepId[] = CHAPTER_STEPS[id]

  return (
    <section
      id={anchor}
      aria-labelledby={`${anchor}-title`}
      className="scroll-mt-24 border-t pt-12 first:border-t-0 first:pt-0"
    >
      <div className="slide-in flex items-start gap-4 sm:gap-6">
        <span
          aria-hidden
          className="font-display text-5xl text-brand tabular-nums sm:text-6xl"
        >
          {String(number).padStart(2, "0")}
        </span>
        <div className="flex flex-col gap-1 pt-1">
          <p className="text-sm font-medium text-muted-foreground">
            {t("chapter", { number })}
          </p>
          <h2
            id={`${anchor}-title`}
            className="text-2xl font-semibold tracking-tight text-balance text-brand-text sm:text-3xl"
          >
            {t(`chapters.${id}.title`)}
          </h2>
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
        {t(`chapters.${id}.lead`)}
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_16rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <ol className="flex flex-col">
          {steps.map((step, i) => (
            <li key={step} className="group/step flex gap-4">
              <div aria-hidden className="flex flex-col items-center">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-muted text-xs font-semibold text-brand-text tabular-nums transition-colors group-hover/step:bg-primary group-hover/step:text-primary-foreground">
                  {i + 1}
                </span>
                {i < steps.length - 1 && (
                  <span className="mt-1.5 w-px flex-1 bg-border" />
                )}
              </div>
              <div className="flex max-w-xl flex-col gap-1 pb-7">
                <h3 className="font-semibold tracking-tight">
                  {t(`steps.${step}.title`)}
                </h3>
                <p className="text-pretty text-muted-foreground">
                  <Trans
                    t={t}
                    i18nKey={`steps.${step}.body`}
                    components={links}
                  />
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="reveal max-w-80 self-start rounded-2xl border bg-muted/40 p-3 transition-colors hover:border-brand/40 max-md:order-first md:sticky md:top-24">
          <Scene chapter={id} />
        </div>
      </div>

      <div className="mt-2 flex max-w-2xl items-start gap-3 rounded-xl border p-4 text-sm">
        <span
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-muted text-brand-text"
        >
          <LightbulbIcon className="size-4" />
        </span>
        <p className="text-pretty">
          <strong className="me-1.5 font-semibold">{t("goodToKnow")}</strong>
          <Trans t={t} i18nKey={`chapters.${id}.note`} components={links} />
        </p>
      </div>

      {children}
    </section>
  )
}
