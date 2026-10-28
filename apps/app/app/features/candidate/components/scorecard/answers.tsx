import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { Button } from "@workspace/ui/components/button"
import { Check, X } from "lucide-react"
import { useEffect, useEffectEvent, useRef, useState } from "react"
import { flushSync } from "react-dom"

import { QuestionText } from "@/components/question-text"
import { StatusBadge } from "@/components/status-badge"

import { isWrong, MCQ, RICH, typeOf } from "../../lib/scorecard"
import type { Question } from "../../schemas/scorecard.schema"
import { Answer } from "./answer"
import { Chapter } from "./chapter"

export function Answers({
  questions,
  own,
  onlyWrong,
  onFilter,
}: {
  questions: Question[]
  own: boolean
  onlyWrong: boolean
  onFilter: (onlyWrong: boolean) => void
}) {
  const { t } = useTranslation("scorecard")
  const locale = useLocale()
  const wrongCount = questions.filter(isWrong).length
  const shown = questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => !onlyWrong || isWrong(q))
  const all = shown.map(({ i }) => String(i))
  const [open, setOpen] = useState<string[]>([])
  const allOpen = all.length > 0 && all.every((id) => open.includes(id))

  // a print shows every answer, then the reader gets their filter and open items back
  const restore = useRef<(() => void) | null>(null)
  const expand = useEffectEvent(() => {
    const before = { onlyWrong, open }
    restore.current = () => {
      onFilter(before.onlyWrong)
      setOpen(before.open)
    }
    flushSync(() => {
      onFilter(false)
      setOpen(questions.map((_, i) => String(i)))
    })
  })
  useEffect(() => {
    const onBefore = () => {
      expand()
    }
    const onAfter = () => {
      restore.current?.()
      restore.current = null
    }
    window.addEventListener("beforeprint", onBefore)
    window.addEventListener("afterprint", onAfter)
    return () => {
      window.removeEventListener("beforeprint", onBefore)
      window.removeEventListener("afterprint", onAfter)
    }
  }, [])

  return (
    <Chapter
      id="answers"
      title={t("answers.heading")}
      hint={t("chapters.answers")}
      action={
        all.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="print:hidden"
            onClick={() => {
              setOpen(allOpen ? [] : all)
            }}
          >
            {allOpen ? t("answers.collapseAll") : t("answers.expandAll")}
          </Button>
        )
      }
    >
      {wrongCount > 0 && (
        <div
          role="group"
          aria-label={t("answers.filter.label")}
          className="flex gap-1.5 print:hidden"
        >
          {[
            {
              wrong: false,
              label: t("answers.filter.all"),
              count: questions.length,
            },
            {
              wrong: true,
              label: t("answers.filter.wrong"),
              count: wrongCount,
            },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              aria-pressed={onlyWrong === chip.wrong}
              onClick={() => {
                onFilter(chip.wrong)
              }}
              className="flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-brand/40 aria-pressed:bg-brand-muted aria-pressed:text-brand-text"
            >
              {chip.label}
              <span className="text-xs tabular-nums opacity-80">
                {new Intl.NumberFormat(locale).format(chip.count)}
              </span>
            </button>
          ))}
        </div>
      )}
      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("answers.none")}</p>
      ) : (
        <Accordion
          multiple
          hiddenUntilFound
          value={open}
          onValueChange={(value) => {
            setOpen(value as string[])
          }}
          className="rounded-xl border"
        >
          {shown.map(({ q, i }) => {
            const type = typeOf(q)
            const upper = (q.type ?? "").toUpperCase()
            const label = t(
              type ? `answers.types.${type}` : "answers.types.other"
            )
            return (
              <AccordionItem key={i} value={String(i)} className="px-4 sm:px-5">
                <AccordionTrigger className="gap-4 hover:no-underline">
                  <span className="flex min-w-0 flex-1 items-start gap-3 text-start">
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-muted text-xs font-semibold text-brand-text tabular-nums"
                    >
                      {new Intl.NumberFormat(locale).format(i + 1)}
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-xs font-normal text-muted-foreground">
                        <span className="sr-only">
                          {t("answers.number", {
                            number: new Intl.NumberFormat(locale).format(i + 1),
                          })}{" "}
                          ·{" "}
                        </span>
                        {label}
                      </span>
                      <span className="line-clamp-2 font-medium">
                        {RICH.has(upper)
                          ? label
                          : q.question_text?.length
                            ? q.question_text
                            : t("answers.noQuestion")}
                      </span>
                    </span>
                  </span>
                  {MCQ.has(upper) && (
                    <StatusBadge tone={q.is_correct ? "success" : "danger"}>
                      {q.is_correct ? (
                        <Check aria-hidden="true" />
                      ) : (
                        <X aria-hidden="true" />
                      )}
                      {q.is_correct ? t("answers.correct") : t("answers.wrong")}
                    </StatusBadge>
                  )}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 ps-9 pb-5">
                  {RICH.has(upper) && q.question_text && (
                    <QuestionText markdown={q.question_text} />
                  )}
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-medium text-muted-foreground">
                      {t("answers.answer")}
                    </h4>
                    <Answer q={q} own={own} />
                  </div>
                  {q.feedback && (
                    <div className="flex flex-col gap-1.5 rounded-lg bg-muted/60 p-3">
                      <h4 className="text-xs font-medium text-brand-text">
                        {t("answers.assessment")}
                      </h4>
                      <p className="max-w-prose text-pretty">{q.feedback}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}
    </Chapter>
  )
}
