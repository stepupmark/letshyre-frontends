import React, { useEffect } from "react";
import { Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FloatingInput } from "@/features/employer/components/onboarding/OnboardingFloatingInput";
import { OnboardingFooter } from "@/features/employer/components/onboarding/OnboardingFooter";

const DESCRIPTION_MAX = 500;

const withScheme = (setValue, name) => (val) => {
  if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
    setValue(name, "https://" + val, { shouldValidate: true });
  }
};

export const OnboardingCompanyDetailsStep = ({
  t,
  register,
  control,
  errors,
  watchAllFields,
  setValue,
  industries,
  isLoadingIndustries,
  saveStatus,
  onNextStep,
  focusOnMount,
  clearFocusOnMount,
}) => {
  const descriptionLength = watchAllFields.company_description?.length || 0;

  // Set when a submit on step 2 fails on a step 1 field; this step only
  // exists in the DOM once the step 2 exit animation has finished.
  useEffect(() => {
    if (!focusOnMount) return;
    const el = document.getElementById(focusOnMount);
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ block: "center" });
    clearFocusOnMount(null);
  }, [focusOnMount, clearFocusOnMount]);

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="mt-1 grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2"
    >
      <FloatingInput
        label={t("form.fields.companyName")}
        name="company_name"
        register={register}
        error={errors.company_name}
        autoComplete="organization"
        maxLength={100}
        required
      />

      <FloatingInput
        label={t("form.fields.companyWebsite")}
        name="company_website"
        type="url"
        register={register}
        error={errors.company_website}
        autoComplete="url"
        required
        onBlurModifier={withScheme(setValue, "company_website")}
      />

      <FloatingInput
        label={t("form.fields.officialEmail")}
        name="official_email"
        type="email"
        register={register}
        error={errors.official_email}
        autoComplete="email"
        required
      />

      <FloatingInput
        label={t("form.fields.registrationNumber")}
        name="company_registration_number"
        register={register}
        error={errors.company_registration_number}
        hint={t("form.fields.registrationNumberTooltip")}
        autoCapitalize="characters"
        maxLength={50}
        required
      />

      <FloatingInput
        label={t("form.fields.panNumber")}
        name="pan_number"
        register={register}
        error={errors.pan_number}
        autoCapitalize="characters"
        maxLength={10}
        required
        transformValue={(v) => v.toUpperCase()}
      />

      <FloatingInput
        label={t("form.fields.gstNumber")}
        name="gst_number"
        register={register}
        error={errors.gst_number}
        autoCapitalize="characters"
        maxLength={15}
        required
        transformValue={(v) => v.toUpperCase()}
      />

      <FloatingInput
        label={t("form.fields.companyAddress")}
        name="company_address"
        register={register}
        error={errors.company_address}
        autoComplete="street-address"
        required
        wrapperClassName="md:col-span-2"
      />

      <div className="relative flex w-full flex-col md:col-span-2">
        {isLoadingIndustries ? (
          <Skeleton className="h-14 w-full rounded-md" />
        ) : (
          <Controller
            name="company_industry"
            control={control}
            render={({ field }) => (
              // Radix emits "" when the value isn't among the options yet, which
              // would wipe an industry restored from a draft.
              <Select value={field.value ?? ""} onValueChange={(v) => v && field.onChange(v)}>
                {/* data-filled stands in for :valid — a Radix trigger is a
                    <button>, which has none; the label keys off it instead. */}
                <SelectTrigger
                  ref={field.ref}
                  id="company_industry"
                  data-filled={field.value ? "true" : undefined}
                  aria-invalid={!!errors.company_industry}
                  aria-required="true"
                  aria-describedby={errors.company_industry ? "company_industry-error" : undefined}
                  className="peer h-auto min-h-14 w-full rounded-md border border-border bg-card px-3 py-3.5 text-base text-text-main shadow-none transition-[border-color] duration-250 focus:border-brand-600 focus-visible:border-brand-600 focus-visible:ring-0 aria-invalid:border-danger max-md:px-3.5 max-md:leading-normal max-sm:px-3.5 max-sm:text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
        <label
          htmlFor="company_industry"
          className="pointer-events-none absolute top-7 start-3 -translate-y-1/2 bg-card px-1.5 text-base text-neutral-400 transition-all duration-250 peer-focus:top-0 peer-focus:text-xs peer-focus:text-brand-600 peer-aria-invalid:peer-focus:text-danger peer-data-[filled=true]:top-0 peer-data-[filled=true]:text-xs peer-data-[filled=true]:text-neutral-500 peer-aria-invalid:peer-data-[filled=true]:text-danger"
        >
          {t("form.fields.selectIndustry")} <span className="ms-0.5 text-danger" aria-hidden="true">*</span>
        </label>
        {errors.company_industry && (
          <span id="company_industry-error" className="mt-1 ms-1 text-xs text-danger">
            {errors.company_industry.message}
          </span>
        )}
      </div>

      <FloatingInput
        label={t("form.fields.linkedinUrl")}
        name="linkedin_url"
        type="url"
        register={register}
        error={errors.linkedin_url}
        hint={t("form.fields.linkedinUrlTooltip")}
        required
        wrapperClassName="md:col-span-2"
        onBlurModifier={withScheme(setValue, "linkedin_url")}
      />

      <div className="flex w-full flex-col md:col-span-2">
        <div className="relative">
          {/* Grows with its content, which takes an inline height write. */}
          <textarea
            id="company_description"
            {...register("company_description")}
            placeholder=" "
            maxLength={DESCRIPTION_MAX}
            className="peer block min-h-24 w-full resize-none overflow-hidden rounded-md border border-border bg-card px-3 pt-3.5 pb-8 text-base text-text-main outline-none transition-[border-color] duration-250 focus:border-brand-600 aria-invalid:border-danger max-md:px-3.5 max-md:leading-normal max-sm:text-sm"
            aria-invalid={!!errors.company_description}
            aria-required="true"
            aria-describedby={["company_description-count", errors.company_description && "company_description-error"].filter(Boolean).join(" ")}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
          ></textarea>
          <label htmlFor="company_description" className="absolute top-3.5 start-3 bg-card px-1.5 text-base text-neutral-400 transition-all duration-250 peer-placeholder-shown:cursor-text peer-focus:-top-2 peer-focus:text-xs peer-focus:text-brand-600 peer-aria-invalid:peer-focus:text-danger peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-neutral-500 peer-aria-invalid:peer-[:not(:placeholder-shown)]:text-danger">
            {t("form.fields.companyDescription")} <span className="ms-0.5 text-danger" aria-hidden="true">*</span>
          </label>
          <span
            id="company_description-count"
            className={cn(
              "pointer-events-none absolute end-3 bottom-2 rounded-sm bg-card px-1.5 py-0.5 text-xs text-neutral-400",
              descriptionLength >= DESCRIPTION_MAX && "text-danger",
            )}
          >
            {t("form.fields.descriptionCount", { count: descriptionLength })}
          </span>
        </div>
        {errors.company_description && (
          <span id="company_description-error" className="mt-1 ms-1 text-xs text-danger">
            {errors.company_description.message}
          </span>
        )}
      </div>

      <OnboardingFooter t={t} saveStatus={saveStatus}>
        <button
          type="button"
          className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-brand-600 px-6 font-semibold text-text-white transition-colors duration-200 hover:bg-brand-700 sm:min-w-48"
          onClick={onNextStep}
        >
          {t("form.next")}
        </button>
      </OnboardingFooter>
    </motion.div>
  );
};
