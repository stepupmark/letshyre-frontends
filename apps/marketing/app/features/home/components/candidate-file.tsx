import { useTranslation } from "@workspace/i18n/react"
import { LockIcon } from "lucide-react"

const SCORES = [
  { key: "jobMatch", value: "92%" },
  { key: "skillMatch", value: "88%" },
  { key: "interview", value: "84/100" },
] as const

/** A resume with a recruiter's pen notes: the evidence LetsHyre adds, shown not told. */
export function CandidateFile() {
  const { t } = useTranslation("home")

  return (
    <figure className="relative mx-auto w-full max-w-md px-6 pt-10 pb-4 sm:px-10 lg:me-0">
      <div
        aria-hidden
        className="absolute inset-x-10 top-12 bottom-10 rotate-3 rounded-2xl border bg-muted/60 sm:inset-x-14"
      />

      <div className="relative -rotate-1 rounded-2xl border bg-card p-6 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_24px_48px_-24px_rgb(0_0_0/0.18)] sm:p-7">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-muted text-sm font-semibold text-brand-text"
          >
            AR
          </span>
          <div className="min-w-0">
            <p className="font-medium">{t("hero.file.name")}</p>
            <p className="truncate text-sm text-muted-foreground">
              {t("hero.file.role")}
            </p>
          </div>
        </div>

        <div aria-hidden className="mt-5 flex flex-col gap-2">
          <span className="h-1.5 w-11/12 rounded-full bg-muted" />
          <span className="h-1.5 w-4/5 rounded-full bg-muted" />
          <span className="h-1.5 w-2/3 rounded-full bg-muted" />
        </div>

        <div className="mt-6 flex items-end justify-between gap-4 border-y py-5">
          <div>
            <p className="text-sm text-muted-foreground">
              {t("hero.file.score")}
            </p>
            <p className="font-display relative mt-1 inline-block px-2 text-6xl leading-none tabular-nums">
              86
              <span className="ms-1 font-sans text-sm text-muted-foreground">
                {t("hero.file.outOf")}
              </span>
              <svg
                aria-hidden
                viewBox="0 0 160 80"
                fill="none"
                className="pointer-events-none absolute -inset-3 size-[calc(100%+1.5rem)] text-brand"
              >
                <path
                  pathLength={1}
                  d="M118 14C96 3 42 4 18 20 0 32 4 58 34 69c30 10 86 9 110-6 18-12 14-34-6-45C124 11 98 8 80 9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="ink"
                />
              </svg>
            </p>
          </div>
          <p className="rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap">
            {t("hero.file.notice")}
          </p>
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-3">
          {SCORES.map((score) => (
            <div key={score.key}>
              <dt className="text-xs text-muted-foreground">
                {t(`hero.file.${score.key}`)}
              </dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">
                {score.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm text-foreground/75">
          <LockIcon aria-hidden className="size-4 shrink-0" />
          {t("hero.file.locked")}
        </p>
      </div>

      <p className="font-script absolute inset-s-0 top-0 -rotate-6 text-3xl text-brand-text sm:-inset-s-2">
        {t("hero.file.notes.interviews")}
      </p>
      <p className="font-script absolute -inset-e-2 top-[61%] rotate-6 text-3xl text-brand-text max-sm:hidden lg:-inset-e-16">
        {t("hero.file.notes.skills")}
      </p>
      <p className="font-script absolute inset-e-6 bottom-12 -rotate-3 text-4xl text-brand-text sm:inset-e-2">
        {t("hero.file.notes.verdict")}
      </p>

      <figcaption className="mt-8 text-center text-xs text-muted-foreground">
        {t("hero.file.caption")}
      </figcaption>
    </figure>
  )
}
