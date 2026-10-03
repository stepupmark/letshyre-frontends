import { Check } from "lucide-react";

export function EditJobModalProgress({ t, steps, currentStep, onStepClick }) {
  return (
    <div className="shrink-0 border-b border-border bg-bg-subtle/50 px-4 py-3 sm:px-6">
      {/* Mobile compact progress bar */}
      <div className="sm:hidden">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text-main">
          <span>
            {t("editJob.stepOf", {
              current: currentStep,
              total: steps.length,
              label: t(`editJob.steps.${steps[currentStep - 1].key}`),
            })}
          </span>
          <span className="text-text-muted">
            {Math.round((currentStep / steps.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop/Tablet interactive step indicator */}
      <div className="hidden sm:flex items-center justify-between gap-2">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          return (
            <div
              key={step.id}
              className="flex items-center flex-1 last:flex-none"
            >
              <button
                type="button"
                onClick={() => onStepClick(step.id)}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-start transition-all ${
                  isCurrent
                    ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20"
                    : isCompleted
                    ? "text-text-main hover:bg-bg-subtle"
                    : "text-text-muted opacity-60 cursor-pointer"
                }`}
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                      ? "bg-primary/20 text-primary"
                      : "bg-border text-text-muted"
                  }`}
                >
                  {isCompleted ? <Check className="size-3.5" /> : step.id}
                </span>
                <span className="text-sm whitespace-nowrap">
                  {t(`editJob.steps.${step.key}`)}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-colors ${
                    isCompleted ? "bg-primary/40" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
