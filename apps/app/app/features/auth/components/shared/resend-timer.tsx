import { useTranslation } from "@workspace/i18n/react"

/** Seconds until another code can be sent, as a draining ring. */
export function ResendTimer({
  seconds,
  total,
}: {
  seconds: number
  total: number
}) {
  const { t } = useTranslation("auth")

  return (
    <span className="flex items-center gap-2 text-muted-foreground tabular-nums">
      <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4 -rotate-90">
        <circle
          cx="10"
          cy="10"
          r="8"
          className="fill-none stroke-muted stroke-[2.5]"
        />
        <circle
          cx="10"
          cy="10"
          r="8"
          pathLength={1}
          strokeDasharray={`${seconds / total} 1`}
          className="fill-none stroke-brand stroke-[2.5] transition-[stroke-dasharray] duration-1000 ease-linear motion-reduce:transition-none"
        />
      </svg>
      {t("code.resendIn", { seconds })}
    </span>
  )
}
