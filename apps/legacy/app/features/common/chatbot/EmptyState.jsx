import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PROMPT_KEYS = ["what", "scorecard", "applications", "interview"];


export function EmptyState({ onPrompt, accent, t }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
      <span className={cn("grid size-14 place-items-center rounded-full", accent.softBg, accent.softText)}>
        <BrainCircuit size={28} strokeWidth={2} aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="m-0 text-lg font-semibold text-text-main">
          {t("chatbot.empty.greeting")}
        </p>
        <p className="m-0 mx-auto max-w-md text-sm text-text-muted">
          {t("chatbot.empty.hint")}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {PROMPT_KEYS.map((key) => {
          const label = t(`chatbot.empty.prompts.${key}`);
          return (
            <Button
              key={key}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => onPrompt(label)}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export default EmptyState;
