import { useTranslation } from "@workspace/i18n/react"

const PROFESSIONAL_X = [50, 130, 210, 290, 370]
// shifted one step so the employer's review sits under the professional's scorecard
const EMPLOYER_X = [130, 210, 290, 370, 450]
const MEET = 290

/** Both journeys at a glance: a professional's scorecard becomes an employer's evidence. */
export function JourneyStrip() {
  const { t } = useTranslation("home")

  return (
    <div
      aria-hidden
      className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 rounded-2xl border bg-muted/40 px-4 py-3 sm:px-6"
    >
      <div className="flex h-full flex-col justify-around py-1 text-xs font-medium sm:text-sm">
        <span className="text-muted-foreground">
          {t("how.strip.professionals")}
        </span>
        <span className="text-brand-text">{t("how.strip.employers")}</span>
      </div>

      <div className="relative w-full max-w-2xl">
        <svg
          viewBox="0 0 560 110"
          fill="none"
          className="block w-full rtl:-scale-x-100"
        >
          <line
            x1={50}
            y1={25}
            x2={370}
            y2={25}
            strokeWidth="2"
            className="stroke-border"
          />
          <line
            x1={130}
            y1={85}
            x2={450}
            y2={85}
            strokeWidth="2"
            className="stroke-border"
          />
          <path
            pathLength={1}
            d={`M50 25H${MEET}V85H450`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="draw-in stroke-brand"
          />
          {PROFESSIONAL_X.map((x) => (
            <circle
              key={x}
              cx={x}
              cy={25}
              r={x === MEET ? 8 : 6}
              strokeWidth="2"
              className="fill-background stroke-brand/50"
            />
          ))}
          {EMPLOYER_X.map((x) => (
            <circle
              key={x}
              cx={x}
              cy={85}
              r={x === MEET ? 8 : 6}
              className="fill-brand"
            />
          ))}
          <circle
            cx={450}
            cy={85}
            r={11}
            strokeWidth="2"
            className="pop-in fill-none stroke-brand"
          />
        </svg>

        <span className="absolute inset-s-55/100 top-1/2 -translate-y-1/2 rounded-full border border-brand/30 bg-background px-2 py-0.5 text-xs font-medium whitespace-nowrap text-brand-text max-sm:hidden">
          {t("how.strip.crossing")}
        </span>
        <span className="pop-in absolute inset-s-84/100 bottom-1/20 text-xs font-semibold text-brand-text sm:text-sm">
          {t("how.strip.hired")}
        </span>
      </div>

      <p className="col-span-2 mt-2 text-xs text-muted-foreground sm:hidden">
        {t("how.strip.crossing")}
      </p>
    </div>
  )
}
