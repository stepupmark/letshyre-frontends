import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEmployeeProfileStore } from "@/features/employee/store/employeeProfile.store";

import ProfileStepper from "@/features/employee/components/profile/ProfileStepper";
import StepIdentity from "@/features/employee/components/profile/StepIdentity";
import StepJobPreferences from "@/features/employee/components/profile/StepJobPreferences";
import StepPhoto from "@/features/employee/components/profile/StepPhoto";
import StepResume from "@/features/employee/components/profile/StepResume";
import StepReview from "@/features/employee/components/profile/StepReview";

import pc_img01 from "@/assets/pc-img01.webp";
import pc_img02 from "@/assets/pc-img02.webp";
import { cn } from "@/lib/utils";


export default function EmployeeOnboarding({ onComplete }) {
  const { t } = useTranslation("employeeOnboarding");

  const methods = useForm({
    mode: "onTouched",
    defaultValues: {
      /* STEP 1 */
      gender: "",
      dob: "",
      aadhar_number: "",
      profile_photo: null,
      location: "",
      address: "",

      /* STEP 2 */
      present_or_last_working_company: "",
      last_day_of_working: "",
      resignation_letter: null,
      experience_letter: null,
      present_offer: null,
      notice_period_proof_type: "",
      notice_period_proof: null,
      current_ctc: "",
      expected_ctc: "",
      preferred_industry: "",
      preferred_locations: [],
      preferred_locations_string: "", // Used for input string

      /* STEP 3 */
      resume: null,
      resume_id: "",
      job_id: "",
      selected_role: "",
      role_other_reason: "",
      suggested_roles: [],
      parsed_resume_data: null,
      ...useEmployeeProfileStore.getState().formData,
    },
  });

  const step = useEmployeeProfileStore((state) => state.step);
  const setStep = useEmployeeProfileStore((state) => state.setStep);
  const setStoreData = useEmployeeProfileStore((state) => state.setFormData);
  const clearStore = useEmployeeProfileStore((state) => state.clearStore);

  useEffect(() => {
    return methods.subscribe({
      formState: { values: true },
      callback: ({ values }) => setStoreData(values),
    });
  }, [methods, setStoreData]);

  const totalSteps = 5;

  const stepMeta = {
    1: {
      image: pc_img01,
      title: t("steps.identity.title"),
      description: t("steps.identity.description"),
    },
    2: {
      image: pc_img01,
      title: t("steps.photo.title"),
      description: t("steps.photo.description"),
    },
    3: {
      image: pc_img02,
      title: t("steps.jobPreferences.title"),
      description: t("steps.jobPreferences.description"),
    },
    4: {
      image: pc_img02, // Reusing as per original code
      title: t("steps.resume.title"),
      description: t("steps.resume.description"),
    },
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem("profileCompleted", "true");
    clearStore(); // Clear draft when fully completed
    onComplete?.();
  };

  return (
    <FormProvider {...methods}>
      {/* `font-family: var(--font-body)` on the card and `var(--font-display)`
          on the two italic headings are dropped, not translated: every
          `--font-*` token resolves to the same Merriweather stack, so all
          three re-declared the inherited body font. The italics stay. */}
      <div className="min-h-full w-full rounded-lg bg-bg-page">
        <div
          className={cn(
            "grid items-stretch gap-6 transition-all duration-300",
            step === 5
              ? "grid-cols-1"
              : "grid-cols-[1fr_2.5fr] max-lg:grid-cols-1",
          )}
        >
          {/* The left panel is `display: none` below lg, so on tablet and
              phone the illustration never renders. */}
          {step !== 5 && (
            <div className="flex min-h-[60vh] flex-col items-center justify-start rounded-lg border border-border bg-card p-6 text-center text-text-muted shadow-sm max-lg:hidden">
              {/* Bleeds over the 24px padding on three sides; the image radius
                  is inset 1px so it sits inside the 1px border. */}
              <div className="-mx-6 -mt-6 mb-6 w-[calc(100%+48px)]">
                <img
                  src={stepMeta[step].image}
                  alt={t("steps.illustrationAlt")}
                  className="block h-70 w-full rounded-t-[15px] object-cover"
                loading="lazy" decoding="async" />
              </div>
              <h3 className="mt-5 mb-2.5 text-lg font-bold italic text-brand-600">
                {stepMeta[step].title}
              </h3>
              <p className="text-sm leading-[1.6]">{stepMeta[step].description}</p>
            </div>
          )}

          <div className="flex min-h-[60vh] flex-col rounded-lg border border-border bg-card p-8 shadow-sm max-md:p-5">
            <div
              className={cn(
                "mb-6",
                step === 5 && "mx-auto mb-8 w-full max-w-225 pt-8",
              )}
            >
              <h2
                className={cn(
                  "mb-6 text-xl font-bold italic text-brand-600",
                  step === 5 && "text-center",
                )}
              >
                {t("steps.progressHeading")}
              </h2>
              <ProfileStepper step={step} />
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && <StepIdentity key="step1" onNext={handleNext} />}
              {step === 2 && (
                <StepPhoto
                  key="step2"
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {step === 3 && (
                <StepJobPreferences
                  key="step3"
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {step === 4 && (
                <StepResume
                  key="step4"
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {step === 5 && (
                <StepReview
                  key="step5"
                  onBack={handleBack}
                  onFinish={handleFinish}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
