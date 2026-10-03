import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HelpCircle, Check, X } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionText } from "@/features/scorecard/components/QuestionText";
import { AnswerRenderer } from "@/features/scorecard-sharing/components/AnswerRenderer";
import { ReportSection } from "@/features/scorecard-sharing/components/ReportSection";
import { cn } from "@/lib/utils";

const MCQ_TYPES = new Set(["MCQ", "MCQ_PSEUDOCODE", "PSEUDOCODE_MCQ"]);

// These types' question_text is a formatted problem statement (headings,
// fenced code/pseudocode blocks) that the trigger's one-line truncation
// can't convey, so it's worth the full markdown render below. Everything
// else is a plain sentence already fully visible in the trigger — repeating
// it below would just be a duplicate.
const RICH_TEXT_TYPES = new Set(["CODING", "MCQ_PSEUDOCODE", "PSEUDOCODE_MCQ"]);

const TYPE_TONE = {
  audio: "bg-warning-bg text-warning",
  coding: "bg-success-bg text-success",
  mcq: "bg-brand-200 text-brand-800",
  mcq_pseudocode: "bg-brand-200 text-brand-800",
  pseudocode_mcq: "bg-brand-200 text-brand-800",
  default: "bg-brand-100 text-brand-700",
};

export function QuestionsAccordion({ questions }) {
  const { t } = useTranslation("sharedScorecard");
  const [openItems, setOpenItems] = useState([]);

  if (questions.length === 0) {
    return (
      <ReportSection id="questions" icon={HelpCircle} title={t("questions.heading")}>
        <p className="m-0 text-sm text-text-muted">{t("questions.empty")}</p>
      </ReportSection>
    );
  }

  const allValues = questions.map((_, i) => `q-${i}`);
  const allOpen = openItems.length === allValues.length;

  return (
    <ReportSection
      id="questions"
      icon={HelpCircle}
      title={t("questions.heading")}
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpenItems(allOpen ? [] : allValues)}
        >
          {allOpen ? t("questions.collapseAll") : t("questions.expandAll")}
        </Button>
      }
    >
      <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="flex flex-col">
        {questions.map((qa, i) => {
          const type = (qa.type || "").toUpperCase();
          const toneKey = (qa.type || "default").toLowerCase();
          const isMcq = MCQ_TYPES.has(type);
          const typeLabel = t(`questions.types.${toneKey}`, t("questions.types.default"));
          // Rich-text types' question_text is markdown source (headings, fenced
          // code) — unreadable squashed onto one truncated line, so the trigger
          // shows the type name instead; the full markdown still renders below.
          const triggerLabel = RICH_TEXT_TYPES.has(type)
            ? typeLabel
            : qa.question_text || t("questions.noQuestionText");

          return (
            <AccordionItem key={i} value={`q-${i}`}>
              <AccordionTrigger className="items-center hover:no-underline">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-500 text-xs font-bold text-text-white">
                    {i + 1}
                  </span>
                  <span
                    className="min-w-0 flex-1 truncate text-sm font-medium text-text-body"
                    title={triggerLabel}
                  >
                    {triggerLabel}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 rounded-full border-transparent px-2.5 py-1 text-xs font-bold tracking-wide uppercase",
                      TYPE_TONE[toneKey] ?? TYPE_TONE.default,
                    )}
                  >
                    {typeLabel}
                  </Badge>
                  {isMcq &&
                    (qa.is_correct ? (
                      <Check size={16} strokeWidth={2.5} className="shrink-0 text-success" aria-hidden="true" />
                    ) : (
                      <X size={16} strokeWidth={2.5} className="shrink-0 text-danger" aria-hidden="true" />
                    ))}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4 ps-10">
                  {RICH_TEXT_TYPES.has(type) && (
                    <QuestionText markdown={qa.question_text || t("questions.noQuestionText")} />
                  )}

                  <div className="rounded-md border border-border-soft bg-bg-subtle p-4">
                    <span className="mb-2 block text-xs font-bold tracking-wide text-text-muted uppercase">
                      {t("questions.candidateAnswer")}
                    </span>
                    <AnswerRenderer qa={qa} type={type} />
                  </div>

                  {qa.feedback && (
                    <p className="m-0 text-sm leading-relaxed text-text-muted italic">{qa.feedback}</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </ReportSection>
  );
}

export default QuestionsAccordion;
