import { useTranslation } from "@workspace/i18n/react"
import { CheckIcon, HandshakeIcon, LockIcon, VideoIcon } from "lucide-react"

import { Avatar } from "@/components/art/avatar"
import { Meter } from "@/components/art/meter"
import { ScoreRing } from "@/components/art/score-ring"

const SCORES = [
  { key: "jobMatch", value: 92, text: "92%" },
  { key: "skillMatch", value: 88, text: "88%" },
  { key: "interview", value: 84, text: "84/100" },
] as const

/** A sample candidate file sitting on a pile: the evidence an employer sees before unlocking. */
export function CandidateFile() {
  const { t } = useTranslation("home")
  const name = t("hero.file.name")

  return (
    <figure className="relative mx-auto w-full max-w-md pt-6 lg:me-0">
      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-x-10 top-10 -bottom-6 rounded-2xl border bg-muted/40"
        />
        <div
          aria-hidden
          className="absolute inset-x-5 top-5 -bottom-3 rounded-2xl border bg-muted"
        />

        <div className="rise relative rounded-2xl border bg-card p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <Avatar name={name} />
            <div className="min-w-0">
              <p className="font-semibold">{name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {t("hero.file.role")}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-5 rounded-xl border bg-muted/40 p-4">
            <ScoreRing score={86} caption={t("hero.file.outOf")} />
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                {t("hero.file.score")}
              </p>
              <p className="mt-2 inline-flex rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium">
                {t("hero.file.notice")}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {SCORES.map((score) => (
              <Meter
                key={score.key}
                label={t(`hero.file.${score.key}`)}
                value={score.value}
                text={score.text}
                animate
              />
            ))}
          </div>

          <p className="mt-6 flex items-center gap-2.5 rounded-lg bg-muted px-3 py-2.5 text-sm text-foreground/80">
            <LockIcon aria-hidden className="size-4 shrink-0" />
            {t("hero.file.locked")}
          </p>
        </div>

        <span
          aria-hidden
          className="pop absolute inset-s-4 -top-4 inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium [animation-delay:700ms] sm:-inset-s-6"
        >
          <VideoIcon className="size-3.5 text-brand-text" />
          {t("hero.file.notes.interviews")}
        </span>
        <span
          aria-hidden
          className="pop absolute inset-e-4 -top-4 inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium [animation-delay:900ms] max-sm:hidden sm:-inset-e-6"
        >
          <CheckIcon className="size-3.5 text-brand-text" />
          {t("hero.file.notes.skills")}
        </span>
        <span
          aria-hidden
          className="pop absolute inset-e-4 -bottom-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground [animation-delay:1100ms] sm:-inset-e-6"
        >
          <HandshakeIcon className="size-3.5" />
          {t("hero.file.notes.verdict")}
        </span>
      </div>

      <figcaption className="mt-12 text-center text-xs text-muted-foreground">
        {t("hero.file.caption")}
      </figcaption>
    </figure>
  )
}
