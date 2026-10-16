import { useTranslation } from "@workspace/i18n/react"
import { CheckIcon, HandshakeIcon, LockIcon, VideoIcon } from "lucide-react"

const SCORES = [
  { key: "jobMatch", value: 92, text: "92%" },
  { key: "skillMatch", value: 88, text: "88%" },
  { key: "interview", value: 84, text: "84/100" },
] as const

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase()

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
            <span
              aria-hidden
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-muted text-sm font-semibold text-brand-text"
            >
              {initials(name)}
            </span>
            <div className="min-w-0">
              <p className="font-semibold">{name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {t("hero.file.role")}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-5 rounded-xl border bg-muted/40 p-4">
            <div className="relative size-20 shrink-0">
              <svg
                aria-hidden
                viewBox="0 0 64 64"
                fill="none"
                className="size-full"
              >
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  strokeWidth="6"
                  className="stroke-muted"
                />
                <path
                  pathLength={1}
                  d="M32 4A28 28 0 1 1 10.43 14.15"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="ink text-brand"
                />
              </svg>
              <span className="absolute inset-0 flex flex-col items-center justify-center tabular-nums">
                <span className="text-2xl/none font-semibold">86</span>
                <span className="text-xs text-muted-foreground">
                  {t("hero.file.outOf")}
                </span>
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                {t("hero.file.score")}
              </p>
              <p className="mt-2 inline-flex rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium">
                {t("hero.file.notice")}
              </p>
            </div>
          </div>

          <dl className="mt-6 flex flex-col gap-4">
            {SCORES.map((score) => (
              <div
                key={score.key}
                className="flex flex-wrap items-baseline justify-between gap-x-4"
              >
                <dt className="text-sm text-muted-foreground">
                  {t(`hero.file.${score.key}`)}
                </dt>
                <dd className="text-sm font-semibold tabular-nums">
                  {score.text}
                </dd>
                <dd aria-hidden className="mt-2 basis-full">
                  <svg
                    viewBox="0 0 100 4"
                    preserveAspectRatio="none"
                    className="block h-1.5 w-full rtl:-scale-x-100"
                  >
                    <rect
                      width="100"
                      height="4"
                      rx="2"
                      className="fill-muted"
                    />
                    <rect
                      width={score.value}
                      height="4"
                      rx="2"
                      className="bar-in fill-brand [animation-delay:400ms]"
                    />
                  </svg>
                </dd>
              </div>
            ))}
          </dl>

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
