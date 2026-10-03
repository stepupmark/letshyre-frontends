import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { FIELD_ERROR, FIELD_LABEL } from "./onboardingFields";
import { BIcon } from "@/components/icons/BootstrapIcons";

const UPLOAD_CARD_JOB =
  "mt-4 rounded-lg border border-dashed border-border bg-bg-subtle p-6";

const UPLOAD_BTN =
  "h-auto gap-2 rounded-md border border-border bg-card px-5 py-3 font-semibold text-text-body shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-600 hover:bg-card hover:text-brand-600 motion-reduce:hover:translate-y-0 max-sm:w-full";

const DOC_CHIP =
  "flex w-full items-center justify-between rounded-sm border border-border bg-bg-subtle px-4 py-3 text-sm shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-all duration-200 hover:border-neutral-300 hover:bg-card max-sm:w-full";

const DOC_BTN =
  "flex size-8 cursor-pointer items-center justify-center rounded-sm border-none bg-transparent p-0 text-base transition-all duration-200";

const DOC_UPLOAD_ITEM =
  "mb-3 flex items-center justify-between gap-4 rounded-md border border-border bg-card p-4 last:mb-0 max-sm:flex-col max-sm:items-start max-sm:gap-3 max-sm:p-3";

const DOC_ACTION = "w-full max-w-87.5 min-w-0 max-sm:w-full";

const DOC_TITLE = "mb-1 text-base font-bold text-text-body";

const DOC_DESC = "text-sm text-neutral-500";

function StepJobPreferencesOptionalDocuments({
  errors,
  handleFile,
  handleViewFile,
  setValue,
  clearErrors,
  presentOffer,
  offerRef,
}) {
  const { t } = useTranslation("employeeOnboarding");

  return (
    <>
      <label className={cn(FIELD_LABEL, "mt-6 block")}>{t("jobPreferences.documents.optionalLabel")}</label>
      <div className={cn(UPLOAD_CARD_JOB, "mt-2")}>
        <div className="mb-3">
          <div className={cn(DOC_UPLOAD_ITEM, "mb-0")}>
          <div className="min-w-0 flex-1 text-start">
            <h4 className={DOC_TITLE}>{t("jobPreferences.documents.presentOffer.title")}</h4>
            <p className={DOC_DESC}>
              {t("jobPreferences.documents.presentOffer.description")}
            </p>
          </div>
          <div className={DOC_ACTION}>
            {presentOffer ? (
              <div className={DOC_CHIP}>
                <div className="flex flex-1 items-center gap-2.5 overflow-hidden">
                  <BIcon name="file-earmark-check" className="text-lg text-success" />
                  <span className="truncate font-medium text-neutral-700">{presentOffer.name}</span>
                </div>
                <div className="ms-3 flex items-center gap-1">
                  <button
                    type="button"
                    className={cn(DOC_BTN, "text-brand-600 hover:bg-brand-100 hover:text-brand-700")}
                    title={t("jobPreferences.documents.viewFile")}
                    onClick={() => handleViewFile(presentOffer)}
                  >
                    <BIcon name="eye" />
                  </button>
                  <button
                    type="button"
                    className={cn(DOC_BTN, "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600")}
                    title={t("jobPreferences.documents.replaceFile")}
                    onClick={() => offerRef.current.click()}
                  >
                    <BIcon name="arrow-repeat" />
                  </button>
                  <button
                    type="button"
                    className={cn(DOC_BTN, "text-danger hover:bg-danger-bg hover:text-danger")}
                    title={t("jobPreferences.documents.removeFile")}
                    onClick={() => setValue("present_offer", null)}
                  >
                    <BIcon name="trash" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className={UPLOAD_BTN}
                onClick={() => offerRef.current.click()}
              >
                <BIcon name="upload" /> {t("jobPreferences.documents.upload")}
              </button>
            )}
            <input
              hidden
              ref={offerRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => handleFile(e, "present_offer")}
            />
          </div>
        </div>
        {errors.present_offer && (
          <div className="mt-1 flex items-center justify-between ps-4">
            <p className={cn(FIELD_ERROR, "m-0")}>
              {errors.present_offer.message}
            </p>
            <button
              type="button"
              onClick={() => clearErrors("present_offer")}
              className="cursor-pointer border-none bg-none text-xs text-neutral-500 underline"
            >
              {t("jobPreferences.documents.clear")}
            </button>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

export default StepJobPreferencesOptionalDocuments;
