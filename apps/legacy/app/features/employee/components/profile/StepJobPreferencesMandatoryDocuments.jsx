import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { FormSelect } from "@/components/common/FormSelect";
import {
  FIELD,
  FIELD_ERROR,
  TOOLTIP_ICON,
  TOOLTIP_TEXT,
  TOOLTIP_WRAP,
} from "./onboardingFields";
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

function StepJobPreferencesMandatoryDocuments({
  control,
  errors,
  handleFile,
  handleViewFile,
  setValue,
  resignationLetter,
  experienceLetter,
  noticePeriodProofType,
  noticePeriodProof,
  resignationRef,
  experienceRef,
  noticeProofRef,
}) {
  const { t } = useTranslation("employeeOnboarding");

  return (
    <div className={UPLOAD_CARD_JOB}>
      {/* Resignation Letter */}
      <div className="mb-3">
        <div className={cn(DOC_UPLOAD_ITEM, "mb-0")}>
        <div className="min-w-0 flex-1 text-start">
          <h4 className={DOC_TITLE}>
            {t("jobPreferences.documents.resignation.title")} <span className="ms-1 text-danger">*</span>
          </h4>
          <p className={DOC_DESC}>
            {t("jobPreferences.documents.resignation.description")}
          </p>
        </div>
        <div className={DOC_ACTION}>
          {resignationLetter ? (
            <div className={DOC_CHIP}>
              <div className="flex flex-1 items-center gap-2.5 overflow-hidden">
                <BIcon name="file-earmark-check" className="text-lg text-success" />
                <span className="truncate font-medium text-neutral-700">{resignationLetter.name}</span>
              </div>
              <div className="ms-3 flex items-center gap-1">
                <button
                  type="button"
                  className={cn(DOC_BTN, "text-brand-600 hover:bg-brand-100 hover:text-brand-700")}
                  title={t("jobPreferences.documents.viewFile")}
                  onClick={() => handleViewFile(resignationLetter)}
                >
                  <BIcon name="eye" />
                </button>
                <button
                  type="button"
                  className={cn(DOC_BTN, "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600")}
                  title={t("jobPreferences.documents.replaceFile")}
                  onClick={() => resignationRef.current.click()}
                >
                  <BIcon name="arrow-repeat" />
                </button>
                <button
                  type="button"
                  className={cn(DOC_BTN, "text-danger hover:bg-danger-bg hover:text-danger")}
                  title={t("jobPreferences.documents.removeFile")}
                  onClick={() => setValue("resignation_letter", null)}
                >
                  <BIcon name="trash" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className={UPLOAD_BTN}
              onClick={() => resignationRef.current.click()}
            >
              <BIcon name="upload" /> {t("jobPreferences.documents.upload")}
            </button>
          )}
          <input
            hidden
            ref={resignationRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => handleFile(e, "resignation_letter")}
          />
        </div>
      </div>
      {errors.resignation_letter && (
        <p className={cn(FIELD_ERROR, "mt-1 ps-4")}>
          {errors.resignation_letter.message}
        </p>
      )}
    </div>

      {/* Experience Letter */}
      <div className="mb-3">
        <div className={cn(DOC_UPLOAD_ITEM, "mb-0")}>
        <div className="min-w-0 flex-1 text-start">
          <h4 className={DOC_TITLE}>
            {t("jobPreferences.documents.experience.title")} <span className="ms-1 text-danger">*</span>
          </h4>
          <p className={DOC_DESC}>
            {t("jobPreferences.documents.experience.description")}
          </p>
        </div>
        <div className={DOC_ACTION}>
          {experienceLetter ? (
            <div className={DOC_CHIP}>
              <div className="flex flex-1 items-center gap-2.5 overflow-hidden">
                <BIcon name="file-earmark-check" className="text-lg text-success" />
                <span className="truncate font-medium text-neutral-700">{experienceLetter.name}</span>
              </div>
              <div className="ms-3 flex items-center gap-1">
                <button
                  type="button"
                  className={cn(DOC_BTN, "text-brand-600 hover:bg-brand-100 hover:text-brand-700")}
                  title={t("jobPreferences.documents.viewFile")}
                  onClick={() => handleViewFile(experienceLetter)}
                >
                  <BIcon name="eye" />
                </button>
                <button
                  type="button"
                  className={cn(DOC_BTN, "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600")}
                  title={t("jobPreferences.documents.replaceFile")}
                  onClick={() => experienceRef.current.click()}
                >
                  <BIcon name="arrow-repeat" />
                </button>
                <button
                  type="button"
                  className={cn(DOC_BTN, "text-danger hover:bg-danger-bg hover:text-danger")}
                  title={t("jobPreferences.documents.removeFile")}
                  onClick={() => setValue("experience_letter", null)}
                >
                  <BIcon name="trash" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className={UPLOAD_BTN}
              onClick={() => experienceRef.current.click()}
            >
              <BIcon name="upload" /> {t("jobPreferences.documents.upload")}
            </button>
          )}
          <input
            hidden
            ref={experienceRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => handleFile(e, "experience_letter")}
          />
        </div>
      </div>
      {errors.experience_letter && (
        <p className={cn(FIELD_ERROR, "mt-1 ps-4")}>
          {errors.experience_letter.message}
        </p>
      )}
    </div>

      {/* Notice Period Proof */}
      <div className="mb-3">
        <div
          className={cn(DOC_UPLOAD_ITEM, "mb-0 flex-col items-start gap-4")}
        >
        <div className="w-full min-w-0 flex-1 text-start">
          <h4 className={DOC_TITLE}>
            {t("jobPreferences.documents.noticeProof.title")} <span className="ms-1 text-danger">*</span>
          </h4>
          <p className={DOC_DESC}>
            {t("jobPreferences.documents.noticeProof.description")}
          </p>
        </div>

        <div
          className="grid w-full grid-cols-[1fr_minmax(auto,350px)] items-start gap-4 max-sm:grid-cols-1"
        >
          <div className="w-full">
            <label className="mb-2 flex items-center text-sm font-semibold text-neutral-600">
              {t("jobPreferences.documents.noticeProof.typeLabel")}
              <div className={TOOLTIP_WRAP}>
                <BIcon name="question-circle" className={TOOLTIP_ICON} />
                <span className={TOOLTIP_TEXT}>
                  {t("jobPreferences.documents.noticeProof.tooltip")}
                </span>
              </div>
              {noticePeriodProofType &&
                !errors.notice_period_proof_type && (
                  <BIcon name="check-circle-fill" className="ms-1.5 text-sm text-success" />
                )}
            </label>
            <Controller
              name="notice_period_proof_type"
              control={control}
              rules={{ required: t("jobPreferences.documents.noticeProof.required") }}
              render={({ field }) => (
                <FormSelect
                  size="auto"
                  className={cn(FIELD, "m-0")}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t("jobPreferences.documents.noticeProof.typePlaceholder")}
                  aria-invalid={!!errors.notice_period_proof_type}
                  options={[
                    { value: "Relieving Letter", label: "Relieving Letter" },
                    { value: "Offer Letter", label: "Offer Letter" },
                  ]}
                />
              )}
            />
            {errors.notice_period_proof_type && (
              <p className={cn(FIELD_ERROR, "mt-1 text-start")}>
                {errors.notice_period_proof_type.message}
              </p>
            )}
          </div>

          <div className={cn(DOC_ACTION, "flex h-full flex-col justify-end")}>
            {/* Invisible, not hidden: it reserves the label row so the
                upload control lines up with the select beside it. */}
            <label className="invisible mb-2 block text-xs font-semibold text-neutral-600">
              {t("jobPreferences.documents.uploadLabel")}
            </label>
            {noticePeriodProof ? (
              <div className={cn(DOC_CHIP, "m-0")}>
                <div className="flex flex-1 items-center gap-2.5 overflow-hidden">
                  <BIcon name="file-earmark-check" className="text-lg text-success" />
                  <span className="truncate font-medium text-neutral-700">{noticePeriodProof.name}</span>
                </div>
                <div className="ms-3 flex items-center gap-1">
                  <button
                    type="button"
                    className={cn(DOC_BTN, "text-brand-600 hover:bg-brand-100 hover:text-brand-700")}
                    title={t("jobPreferences.documents.viewFile")}
                    onClick={() => handleViewFile(noticePeriodProof)}
                  >
                    <BIcon name="eye" />
                  </button>
                  <button
                    type="button"
                    className={cn(DOC_BTN, "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-600")}
                    title={t("jobPreferences.documents.replaceFile")}
                    onClick={() => noticeProofRef.current.click()}
                  >
                    <BIcon name="arrow-repeat" />
                  </button>
                  <button
                    type="button"
                    className={cn(DOC_BTN, "text-danger hover:bg-danger-bg hover:text-danger")}
                    title={t("jobPreferences.documents.removeFile")}
                    onClick={() => setValue("notice_period_proof", null)}
                  >
                    <BIcon name="trash" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className={cn(UPLOAD_BTN, "m-0")}
                onClick={() => noticeProofRef.current.click()}
              >
                <BIcon name="upload" /> {t("jobPreferences.documents.noticeProof.uploadProof")}
              </button>
            )}
            <input
              hidden
              ref={noticeProofRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => handleFile(e, "notice_period_proof")}
            />
          </div>
        </div>
      </div>
      {errors.notice_period_proof && (
        <p className={cn(FIELD_ERROR, "mt-1 ps-4")}>
          {errors.notice_period_proof.message}
        </p>
      )}
    </div>
    </div>
  );
}

export default StepJobPreferencesMandatoryDocuments;
