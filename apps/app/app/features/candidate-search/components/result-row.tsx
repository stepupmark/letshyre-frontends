import { useTranslation } from "@workspace/i18n/react"
import { ChevronRight, CircleCheck } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import type { KeyboardEvent } from "react"

import { ScoreBand } from "@/components/score-band"
import { spring } from "@/lib/motion"

import { nameOf, rowKey } from "../lib/result"
import type { SearchResult } from "../schemas/candidate-search.schema"
import { Facts, Highlight, PersonAvatar } from "./person"

const SKILLS_SHOWN = 3

export function ResultRow({
  row,
  search,
  open,
  onOpen,
  onKeyDown,
}: {
  row: SearchResult
  search: string
  open: boolean
  onOpen: () => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
}) {
  const { t } = useTranslation("candidateSearch")
  const name = nameOf(row, t("card.unnamed"))
  const role = row.interviewed_role ?? row.current_role
  const skills = row.skills_preview ?? []
  const score = row.interview_score

  return (
    <button
      type="button"
      data-row={rowKey(row)}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      className="group flex w-full items-start gap-4 rounded-xl border bg-card p-4 text-start transition-colors outline-none hover:border-foreground/20 hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:border-brand/40 aria-expanded:bg-brand-muted/40 motion-reduce:transition-none sm:px-5"
    >
      <PersonAvatar row={row} name={name} className="size-11" />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-base font-semibold tracking-tight text-brand-text">
            {name}
          </span>
          <AnimatePresence initial={false}>
            {row.already_unlocked && (
              <m.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={spring}
                className="flex shrink-0"
              >
                <CircleCheck
                  role="img"
                  aria-label={t("card.unlocked")}
                  className="size-4 text-success"
                />
              </m.span>
            )}
          </AnimatePresence>
        </span>
        {role && (
          <span className="truncate text-sm">
            <Highlight text={role} term={search} />
          </span>
        )}
        <Facts
          row={row}
          className="truncate text-xs text-muted-foreground tabular-nums"
        />
        {score != null && (
          <span className="mt-1 sm:hidden">
            <ScoreBand score={score} of="interview" />
          </span>
        )}
        {skills.length > 0 && (
          <span className="mt-1.5 flex flex-wrap gap-1.5">
            {skills.slice(0, SKILLS_SHOWN).map((skill) => (
              <span
                key={skill}
                className="max-w-40 truncate rounded-full border px-2 py-0.5 text-xs"
              >
                {skill}
              </span>
            ))}
            {skills.length > SKILLS_SHOWN && (
              <span className="px-1 py-0.5 text-xs text-muted-foreground tabular-nums">
                {t("card.moreSkills", { n: skills.length - SKILLS_SHOWN })}
              </span>
            )}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-3 self-center">
        {score != null && (
          <span className="max-sm:hidden">
            <ScoreBand score={score} of="interview" />
          </span>
        )}
        <ChevronRight
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5 rtl:group-focus-visible:-translate-x-0.5"
        />
      </span>
    </button>
  )
}
