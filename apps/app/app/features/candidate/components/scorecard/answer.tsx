import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { Check, X } from "lucide-react"

import { safeUrl } from "@/lib/safe-url"

import { MCQ } from "../../lib/scorecard"
import type { Question } from "../../schemas/scorecard.schema"

export function Answer({ q, own }: { q: Question; own: boolean }) {
  const { t } = useTranslation("scorecard")
  const type = (q.type ?? "").toUpperCase()

  if (MCQ.has(type)) {
    return (
      <ul className="flex flex-col gap-1.5">
        {(q.options ?? []).map((option, i) => {
          const chosen = option === q.answer_provided
          const correct = option === q.correct_answer
          return (
            <li
              key={i}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border px-3 py-2",
                correct && "border-success/40 bg-success-muted",
                chosen && !correct && "border-danger/40 bg-danger-muted"
              )}
            >
              <span className="flex items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0">
                {correct ? (
                  <Check className="text-success" />
                ) : chosen ? (
                  <X className="text-danger" />
                ) : null}
                {option}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {[
                  chosen && (own ? t("answers.yours") : t("answers.chosen")),
                  correct && t("answers.correctAnswer"),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </li>
          )
        })}
      </ul>
    )
  }

  if (type === "CODING") {
    return q.answer_provided ? (
      <pre className="overflow-x-auto rounded-lg bg-muted px-4 py-3 font-mono text-[0.8125rem]">
        <code>{q.answer_provided}</code>
      </pre>
    ) : (
      <p className="text-muted-foreground">{t("answers.noCode")}</p>
    )
  }

  if (type === "AUDIO") {
    const audio = safeUrl(q.candidate_audio_file_url)
    return audio ? (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <audio
        controls
        preload="none"
        src={audio}
        className="w-full print:hidden"
      >
        {t("answers.audioUnsupported")}
      </audio>
    ) : (
      <p className="text-muted-foreground">{t("answers.noAudio")}</p>
    )
  }

  return q.answer_provided ? (
    <p className="max-w-prose text-pretty whitespace-pre-line">
      {q.answer_provided}
    </p>
  ) : (
    <p className="text-muted-foreground">{t("answers.noAnswer")}</p>
  )
}
