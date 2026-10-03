import React from "react";
import { useWatch } from "react-hook-form";
import { motion } from "framer-motion";
import { DOCUMENT_FIELDS } from "@/features/employer/schemas/onboarding.schema";
import { FileUpload } from "@/features/employer/components/onboarding/OnboardingFileUpload";
import { OnboardingFooter } from "@/features/employer/components/onboarding/OnboardingFooter";

export const OnboardingDocumentsStep = ({
  t,
  control,
  errors,
  setPreviewModalImage,
  onBackStep,
  isPending,
  saveStatus,
}) => {
  const files = useWatch({ control, name: DOCUMENT_FIELDS.map((f) => f.name) });
  const uploaded = files.filter(Boolean).length;

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="mt-1 flex w-full flex-col gap-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h3 className="text-base font-semibold text-neutral-600">{t("form.uploadHeading")}</h3>
          <p className="mt-1 text-sm text-neutral-500">{t("form.uploadSubheading")}</p>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-600" aria-live="polite">
          {t("form.upload.progress", { count: uploaded, total: DOCUMENT_FIELDS.length })}
        </span>
      </div>

      {DOCUMENT_FIELDS.map(({ name, kind, label }) => (
        <FileUpload
          key={name}
          name={name}
          kind={kind}
          label={t(`form.documents.${label}`)}
          hint={t(`form.documents.${label}Tooltip`)}
          control={control}
          error={errors[name]}
          onPreview={kind === "image" ? setPreviewModalImage : undefined}
          required
        />
      ))}

      <OnboardingFooter t={t} saveStatus={saveStatus}>
        <button
          type="button"
          className="min-h-12 flex-1 cursor-pointer rounded-md border border-border bg-card px-6 font-semibold text-text-body transition-colors duration-200 hover:border-neutral-400 hover:bg-bg-subtle sm:flex-none sm:min-w-36"
          onClick={onBackStep}
        >
          {t("form.back")}
        </button>
        <button
          type="submit"
          className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-brand-600 px-6 font-semibold text-text-white transition-[background,opacity] duration-200 hover:not-disabled:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none sm:min-w-48"
          disabled={isPending}
        >
          {isPending && (
            <span className="size-4.5 animate-spin rounded-full border-2 border-text-white/30 border-t-text-white motion-reduce:animate-none" aria-hidden="true"></span>
          )}
          {isPending ? t("form.processing") : t("form.submit")}
        </button>
      </OnboardingFooter>
    </motion.div>
  );
};
