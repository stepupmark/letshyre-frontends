import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const MCQ_TYPES = new Set(["MCQ", "MCQ_PSEUDOCODE", "PSEUDOCODE_MCQ"]);

function CodeBlock({ code }) {
  return (
    <pre className="m-0 overflow-x-auto rounded-md border border-border-soft bg-bg-subtle px-4 py-3 font-mono text-sm leading-relaxed whitespace-pre text-neutral-700">
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

/** Renders a candidate's answer, shaped to the question's type. */
export function AnswerRenderer({ qa, type }) {
  const { t } = useTranslation("sharedScorecard");

  if (MCQ_TYPES.has(type)) return <McqOptions qa={qa} />;

  if (type === "CODING") {
    return <CodeBlock code={qa.answer_provided || t("questions.noCode")} />;
  }

  if (type === "AUDIO") {
    if (!qa.candidate_audio_file_url) {
      return <p className="m-0 text-sm text-text-body">{t("questions.noAudio")}</p>;
    }
    return (
      <audio controls preload="none" src={qa.candidate_audio_file_url} className="h-10.5 w-full outline-none">
        {t("questions.audioUnsupported")}
      </audio>
    );
  }

  return <p className="m-0 text-sm leading-relaxed text-text-body">{qa.answer_provided || t("questions.noAnswer")}</p>;
}

export default AnswerRenderer;
