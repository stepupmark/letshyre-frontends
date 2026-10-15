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
import type { ReactNode } from "react"

/** First-time empty: one sentence and the one action that fills the page. */
export function EmptyState({
  title,
  description,
  action,
  art,
}: {
  title: string
  description: string
  action?: ReactNode
  /** a drawn illustration above the title */
  art?: ReactNode
}) {
  return (
    <Empty className="border">
      <EmptyHeader>
        {art && <EmptyMedia>{art}</EmptyMedia>}
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  )
}

/** Filtered to nothing: say so and offer the way back. */
export function NoMatches({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation("common")
  return (
    <EmptyState
      title={t("empty.filteredTitle")}
      description={t("empty.filteredBody")}
      action={
        <Button variant="outline" onClick={onClear}>
          {t("empty.clearFilters")}
        </Button>
      }
    />
  )
}
