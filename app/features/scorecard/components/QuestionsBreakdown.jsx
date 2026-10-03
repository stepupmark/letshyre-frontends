import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { QuestionText } from "@/features/scorecard/components/QuestionText";


import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


// Tone by question type; unknown types fall back to a neutral brand tone.
const SV_QA_BADGE =
  "inline-block rounded-full border-transparent px-2.5 py-1 text-xs font-bold tracking-wider uppercase";
const SV_QA_TONE = {
  audio: "bg-warning-bg text-warning",
  coding: "bg-success-bg text-success",
  mcq_pseudocode: "bg-brand-200 text-brand-800",
  pseudocode_mcq: "bg-brand-200 text-brand-800",
  default: "bg-brand-100 text-brand-700",
};

/** MCQ-style question types (plain MCQ + pseudocode MCQ variants). */
const MCQ_TYPES = new Set(["MCQ", "MCQ_PSEUDOCODE", "PSEUDOCODE_MCQ"]);

/** Enum -> catalog key; falls back to the raw type with underscores spaced. */
const TYPE_KEYS = {
  MCQ: "mcq",
  MCQ_PSEUDOCODE: "pseudocodeMcq",
  PSEUDOCODE_MCQ: "pseudocodeMcq",
  CODING: "coding",
  TYPING: "typing",
  AUDIO: "audio",
};

const formatType = (type, t) =>
  TYPE_KEYS[type]
    ? t(`questions.types.${TYPE_KEYS[type]}`)
    : String(type || "Q").replace(/_/g, " ");

// Read the code snippet defensively across likely field names (backend not final yet).
const getCodeSnippet = (qa) =>
  qa.code_snippet || qa.pseudocode || qa.pseudo_code || qa.question_code || "";

/** A reusable code block — monospace, preserves formatting, scrolls sideways. */
function CodeBlock({ code, className = "" }) {
  return (
    <pre className={cn("m-0 overflow-x-auto rounded-md border border-border-soft bg-bg-subtle px-4 py-3 [&_code]:font-mono [&_code]:text-sm [&_code]:leading-[1.6] [&_code]:whitespace-pre [&_code]:text-neutral-700 [&_code]:[tab-size:4]", className)}>
      <code>{code}</code>
    </pre>
  );
}

function McqOptions({ qa }) {
  return (
    <div className="flex flex-col gap-2">
      {qa.options?.map((opt, i) => {
        const selected = qa.answer_provided === opt;
        const correct = qa.correct_answer === opt;
        return (
          <div
            key={i}
            className={cn(
              "flex items-center justify-between gap-2 rounded-sm border border-border bg-card px-4 py-2.5 text-sm text-text-body",
              selected && "border-brand-400 bg-brand-100",
              correct && "border-success bg-success-bg font-semibold text-success",
            )}
          >
            <span>{opt}</span>
            {correct && <Check size={15} strokeWidth={2.5} aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}

/** Renders the typed answer body for a single question. */
function AnswerBody({ qa, type }) {
  const { t } = useTranslation("scorecard");
  if (MCQ_TYPES.has(type)) {
    return <McqOptions qa={qa} />;
  }

  if (type === "CODING") {
    return <CodeBlock code={qa.answer_provided || t("questions.noCode")} />;
  }

  if (type === "AUDIO") {
    if (!qa.candidate_audio_file_url) {
      return <p className="m-0 text-sm leading-[1.6] text-text-body">{t("questions.noAudio")}</p>;
    }
    return (
      <div className="w-full">
        <audio
          controls
          src={qa.candidate_audio_file_url}
          className="h-10.5 w-full outline-none"
          preload="metadata"
        >
          {t("questions.audioUnsupported")}
        </audio>
      </div>
    );
  }

  return (
    <p className="m-0 text-sm leading-[1.6] text-text-body">{qa.answer_provided || t("questions.noAnswer")}</p>
  );
}

/** Full Q&A breakdown list. */
export function QuestionsBreakdown({ questions }) {
  const { t } = useTranslation("scorecard");
  return (
    <div className="rounded-lg border border-border-soft bg-card p-6 shadow-sm max-sm:p-4">
      <h3 className="mt-0 mb-5 text-lg font-bold text-text-main">{t("questions.heading")}</h3>
      {questions.length === 0 ? (
        <p className="m-0 text-sm text-text-muted">{t("questions.empty")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {questions.map((qa, i) => {
            const type = (qa.type || "").toUpperCase();
            const badgeClass = (qa.type || "unknown").toLowerCase();
            const snippet = getCodeSnippet(qa);
            return (
              <div key={i} className="rounded-md border border-border-soft bg-bg-subtle p-5 max-sm:p-4">
                <div className="mb-3">
                  <Badge variant="outline" className={cn(SV_QA_BADGE, SV_QA_TONE[badgeClass] ?? SV_QA_TONE.default)}>
                    {formatType(type, t)}
                  </Badge>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid h-6.5 min-w-6.5 shrink-0 place-items-center rounded-full bg-brand-500 text-xs font-bold text-text-white">{i + 1}</span>
                  <QuestionText
                    markdown={qa.question_text || t("questions.noQuestionText")}
                  />
                </div>

                {snippet && (
                  <CodeBlock code={snippet} className="mt-3" />
                )}

                <div className="mt-4 rounded-md border border-border-soft bg-card p-4">
                  <span className="mb-2 block text-xs font-bold tracking-[0.04em] uppercase text-text-muted">
                    {t("questions.candidateAnswer")}
                  </span>
                  <AnswerBody qa={qa} type={type} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default QuestionsBreakdown;
