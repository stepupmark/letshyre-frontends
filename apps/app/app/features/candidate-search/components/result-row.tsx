import { useTranslation } from "@workspace/i18n/react"
import { CircleCheck } from "lucide-react"
import * as m from "motion/react-m"
import type { KeyboardEvent } from "react"

import { ScoreBand } from "@/components/score-band"
import { spring } from "@/lib/motion"

import { nameOf } from "../lib/result"
import type { SearchResult } from "../schemas/candidate-search.schema"
import { Facts, Highlight, PersonAvatar } from "./person"

const SELECTED_LAYOUT = "selected-result"

export function ResultRow({
  row,
  search,
  selected,
  onSelect,
  onKeyDown,
}: {
  row: SearchResult
  search: string
  selected: boolean
  onSelect: () => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
}) {
  const { t } = useTranslation("candidateSearch")
  const name = nameOf(row, t("card.unnamed"))
  const role = row.interviewed_role ?? row.current_role

  return (
    <button
      type="button"
      data-row
      aria-current={selected || undefined}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className="group relative flex w-full items-center gap-3 px-4 py-3 text-start transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset motion-reduce:transition-none max-lg:min-h-16"
    >
      {selected && (
        <m.span
          layoutId={SELECTED_LAYOUT}
          transition={spring}
          aria-hidden="true"
          className="absolute inset-0 bg-brand-muted"
        />
      )}
      <PersonAvatar row={row} name={name} className="relative" />
      <span className="relative flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-brand-text">
            {name}
          </span>
          {row.already_unlocked && (
            <CircleCheck
              role="img"
              aria-label={t("card.unlocked")}
              className="size-3.5 shrink-0 text-success"
            />
          )}
        </span>
        {role && (
          <span className="truncate text-sm">
            <Highlight text={role} term={search} />
          </span>
        )}
        <Facts
          row={row}
          className="truncate text-xs text-muted-foreground tabular-nums group-aria-current:text-brand-text"
        />
      </span>
      {row.interview_score != null && (
        <span className="relative shrink-0 max-sm:hidden">
          <ScoreBand score={row.interview_score} of="interview" />
        </span>
      )}
    </button>
  )
}
