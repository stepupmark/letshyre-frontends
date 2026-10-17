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
import { RotateCw } from "lucide-react"

import type { ShareProblem } from "../types"
import { LinkScene } from "./art/link-scenes"

export function LinkUnavailable({
  problem,
  onRetry,
  retrying = false,
}: {
  problem: ShareProblem
  onRetry?: () => void
  retrying?: boolean
}) {
  const { t } = useTranslation("scorecard")

  return (
    <Empty className="mx-auto max-w-md">
      <EmptyHeader>
        <EmptyMedia>
          <LinkScene problem={problem} />
        </EmptyMedia>
        <EmptyTitle>
          <h1 tabIndex={-1} className="text-xl text-brand-text outline-none">
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
