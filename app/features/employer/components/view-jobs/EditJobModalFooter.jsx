import { AlertCircle, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditJobModalFooter({
  t,
  steps,
  currentStep,
  isDirty,
  showConfirmDiscard,
  setShowConfirmDiscard,
  onClose,
  handleCloseAttempt,
  prevStep,
  nextStep,
  handleUpdate,
  isUpdatePending,
}) {
  return (
    <div className="shrink-0 border-t border-border bg-bg-subtle/30 px-4 py-3 sm:px-6 sm:py-4">
      {showConfirmDiscard ? (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400">
            <AlertCircle className="size-4 shrink-0" />
            <span>{t("editJob.unsavedChanges")}</span>
          </div>
          <div className="flex items-center gap-2 w-full justify-end sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfirmDiscard(false)}
            >
              {t("editJob.keepEditing")}
            </Button>
            <Button size="sm" variant="destructive" onClick={onClose}>
              {t("editJob.discard")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left Side: Back button and dirty status */}
          <div className="flex items-center justify-between sm:justify-start gap-3">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="gap-1.5"
              >
                <ArrowLeft className="size-4 rtl:-scale-x-100" />
                {t("editJob.back")}
              </Button>
            ) : (
              <div className="hidden sm:block text-xs text-text-muted">
                {isDirty ? (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    {t("editJob.unsavedShort")}
                  </span>
                ) : (
                  <span>{t("editJob.step1Of3")}</span>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Cancel, Next, or Submit */}
          <div className="flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseAttempt}
            >
              {t("editJob.cancel")}
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="gap-1.5 px-5 font-semibold"
              >
                {t("editJob.next")}
                <ArrowRight className="size-4 rtl:-scale-x-100" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleUpdate}
                disabled={isUpdatePending}
                className="gap-1.5 px-5 font-semibold"
              >
                {isUpdatePending ? t("editJob.updating") : t("editJob.updateJob")}
                <Check className="size-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
