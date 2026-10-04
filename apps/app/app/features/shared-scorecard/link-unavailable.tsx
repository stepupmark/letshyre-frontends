import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import {
  EyeOff,
  Link2Off,
  RotateCw,
  TimerOff,
  TriangleAlert,
} from "lucide-react"

import type { ShareProblem } from "./query"

const ICON = {
  invalid: Link2Off,
  expired: TimerOff,
  limit: EyeOff,
  unavailable: TriangleAlert,
}

export function LinkUnavailable({
  problem,
  onRetry,
  retrying = false,
}: {
  problem: ShareProblem
  onRetry?: () => void
  retrying?: boolean
}) {
  const { t } = useTranslation("sharedScorecard")
  const Icon = ICON[problem]

  return (
    <Empty className="mx-auto max-w-md">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>
          <h1 tabIndex={-1} className="outline-none">
            {t(`unavailable.${problem}.title`)}
          </h1>
        </EmptyTitle>
        <EmptyDescription>{t(`unavailable.${problem}.body`)}</EmptyDescription>
      </EmptyHeader>
      {problem === "unavailable" && onRetry && (
        <EmptyContent>
          <Button variant="outline" onClick={onRetry} disabled={retrying}>
            <RotateCw
              className={
                retrying ? "animate-spin motion-reduce:animate-none" : undefined
              }
            />
            {t("unavailable.retry")}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}
