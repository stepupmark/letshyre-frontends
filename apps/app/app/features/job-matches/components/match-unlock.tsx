import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Clock, LockOpen } from "lucide-react"

import { StatusBadge } from "@/components/status-badge"

import { unlockProgress } from "../lib/job-matches"
import type { Match } from "../schemas/job-matches.schema"

export function MatchUnlock({
  match,
  onOpen,
}: {
  match: Match
  onOpen: () => void
}) {
  const { t } = useTranslation("matches")
  const { unlocked, total } = unlockProgress(match)

  if (total === 0)
    return (
      <StatusBadge tone="neutral">
        <Clock aria-hidden="true" />
        {t("noInterview")}
      </StatusBadge>
    )
  if (unlocked === total)
    return <StatusBadge tone="success">{t("unlocked")}</StatusBadge>
  return (
    <span className="flex flex-col items-start gap-1">
      <Button
        variant="outline"
        size="sm"
        aria-label={t("unlockFor", {
          name: match.candidate_name ?? t("unnamed"),
        })}
        onClick={onOpen}
      >
        <LockOpen aria-hidden="true" />
        {t("columns.unlock")}
      </Button>
      {unlocked > 0 && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {t("partlyUnlocked", { unlocked, total })}
        </span>
      )}
    </span>
  )
}
