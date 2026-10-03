import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DOCUMENT_FIELDS,
  makeEmployerOnboardingSchema,
  defaultValues,
} from "@/features/employer/schemas/onboarding.schema";
import { useSubmitOnboarding } from "@/features/employer/hooks/useEmployerOnboarding";
import { useIndustries } from "@/hooks/useIndustries";
import { getUser, setUser } from "@/lib/authStorage";
import { toast } from "@/lib/toast";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { OnboardingCompanyDetailsStep } from "@/features/employer/components/onboarding/OnboardingCompanyDetailsStep";
import { OnboardingDocumentsStep } from "@/features/employer/components/onboarding/OnboardingDocumentsStep";

const DRAFT_KEY = "employer_onboarding_draft";

// Visual order, so "first invalid" means the one nearest the top.
const DETAIL_FIELDS = [
  "company_name",
  "company_website",
  "official_email",
  "company_registration_number",
  "pan_number",
  "gst_number",
  "company_address",
  "company_industry",
  "linkedin_url",
  "company_description",
];

const focusField = (name) => {
  const el = document.getElementById(name);
  if (!el) return;
  el.focus({ preventScroll: true });
  el.scrollIntoView({ block: "center" });
};

export const OnboardingForm = ({ onNextStep }) => {
  const { t } = useTranslation("onboarding");
  const [formStep, setFormStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    data: industries,
    isLoading,
    isPlaceholderData,
  } = useIndustries();
  const isLoadingIndustries = isLoading || isPlaceholderData;
  const { mutate: submitOnboarding, isPending } = useSubmitOnboarding();

  // The signed-in record is stored either flat or wrapped, the same two shapes
  // the submit handler below unwraps.
  const storedUser = useMemo(() => {
    const record = getUser();
    return record?.user ?? record;
  }, []);

  const [isShaking, setIsShaking] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [previewModalImage, setPreviewModalImage] = useState(null);
  const [focusOnMount, setFocusOnMount] = useState(null);
  const formRef = useRef(null);

  const schema = useMemo(() => makeEmployerOnboardingSchema(t), [t]);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    reset,
    setValue,
    getFieldState,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  const watchAllFields = useWatch({ control });

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    let initialData = { ...defaultValues };

    if (savedDraft) {
      try {
        initialData = { ...initialData, ...JSON.parse(savedDraft) };
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }

    if (storedUser) {
      if (!initialData.official_email && storedUser.email) {
        initialData.official_email = storedUser.email;
      }
      if (!initialData.company_name && (storedUser.name || storedUser.first_name)) {
        initialData.company_name = storedUser.name || storedUser.first_name;
      }
    }

    reset(initialData);
  }, [reset, storedUser]);

  // Files can't go into localStorage, so only the text fields are drafted.
  const draftJson = JSON.stringify(
    Object.fromEntries(DETAIL_FIELDS.map((key) => [key, watchAllFields[key] ?? ""])),
  );

  useEffect(() => {
    if (!Object.values(JSON.parse(draftJson)).some(Boolean)) return undefined;
    let hideTimer;
    const saveTimer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, draftJson);
      setSaveStatus("saved");
      hideTimer = setTimeout(() => setSaveStatus(null), 2000);
    }, 800);
    return () => {
      clearTimeout(saveTimer);
      clearTimeout(hideTimer);
    };
  }, [draftJson]);

  const goToStep = (step) => {
    setFormStep(step);
    formRef.current?.scrollIntoView({ block: "start" });
  };

  const shake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleNextStep = async () => {
    if (await trigger(DETAIL_FIELDS)) {
      goToStep(2);
      return;
    }
    shake();
    focusField(DETAIL_FIELDS.find((name) => getFieldState(name).invalid));
  };

  const handleInvalidSubmit = (formErrors) => {
    shake();
    const first = [...DETAIL_FIELDS, ...DOCUMENT_FIELDS.map((f) => f.name)].find(
      (name) => formErrors[name],
    );
    if (DETAIL_FIELDS.includes(first)) {
      setFocusOnMount(first);
      setFormStep(1);
    } else {
      focusField(first);
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    submitOnboarding(formData, {
      onSuccess: () => {
        localStorage.removeItem(DRAFT_KEY);

        // The route guard reads this flag to decide onboarding is complete.
        const userObj = getUser();
        if (userObj && Object.keys(userObj).length > 0) {
          if (userObj.user) {
            userObj.user.is_profile_completed = true;
          } else {
            userObj.is_profile_completed = true;
          }
          setUser(userObj);
        }

        setIsSuccess(true);
        setTimeout(() => {
          onNextStep();
        }, 1800);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || t("form.toasts.submitFailed"),
        );
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-75 flex-col items-center justify-center text-center">
        {/* success-checkmark CSS lives in tailwind.css — no utility equivalent. */}
        <div className="success-checkmark">
          <div className="check-icon">
            <span className="icon-line line-tip"></span>
            <span className="icon-line line-long"></span>
            <div className="icon-circle"></div>
            <div className="icon-fix"></div>
          </div>
        </div>
        <h3 className="mt-5 text-2xl text-success">{t("form.successTitle")}</h3>
        <p className="mt-2.5 text-neutral-500">{t("form.successBody")}</p>
      </div>
    );
  }

  const stepCircle = (active) =>
    cn(
      "mb-2 flex size-8 items-center justify-center rounded-full border-2 border-neutral-300 bg-neutral-100 font-bold text-neutral-500 transition-all duration-300",
      active && "border-brand-600 bg-brand-600 text-text-white",
    );

  return (
    <form
      ref={formRef}
      noValidate
      className={cn("scroll-mt-6 flex-1", isShaking && "animate-shake motion-reduce:animate-none")}
      onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)}
    >
      <ol className="mb-8 flex list-none items-start justify-center px-5 max-sm:px-0 [&>li]:m-0">
        <li>
          <button
            type="button"
            className="flex flex-col items-center disabled:cursor-default enabled:cursor-pointer"
            onClick={() => goToStep(1)}
            disabled={formStep === 1}
            aria-current={formStep === 1 ? "step" : undefined}
          >
            <span className={stepCircle(true)}>1</span>
            <span className="text-xs font-semibold text-neutral-500">{t("form.progress.step1Label")}</span>
          </button>
        </li>
        <li aria-hidden="true" className="relative top-4 mx-4 h-0.5 flex-1 bg-neutral-300">
          <span className={cn("block h-full bg-brand-600 transition-[width] duration-300", formStep === 2 ? "w-full" : "w-0")}></span>
        </li>
        <li
          className={cn("flex flex-col items-center opacity-50 transition-opacity duration-300", formStep === 2 && "opacity-100")}
          aria-current={formStep === 2 ? "step" : undefined}
        >
          <span className={stepCircle(formStep === 2)}>2</span>
          <span className="text-xs font-semibold text-neutral-500">{t("form.progress.step2Label")}</span>
        </li>
      </ol>

      <AnimatePresence mode="wait">
        {formStep === 1 && (
          <OnboardingCompanyDetailsStep
            t={t}
            register={register}
            control={control}
            errors={errors}
            watchAllFields={watchAllFields}
            setValue={setValue}
            industries={industries}
            isLoadingIndustries={isLoadingIndustries}
            saveStatus={saveStatus}
            onNextStep={handleNextStep}
            focusOnMount={focusOnMount}
            clearFocusOnMount={setFocusOnMount}
          />
        )}

        {formStep === 2 && (
          <OnboardingDocumentsStep
            t={t}
            control={control}
            errors={errors}
            setPreviewModalImage={setPreviewModalImage}
            onBackStep={() => goToStep(1)}
            isPending={isPending}
            saveStatus={saveStatus}
          />
        )}
      </AnimatePresence>

      {previewModalImage && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-text-main/85 backdrop-blur-[4px] animate-in fade-in duration-200 motion-reduce:animate-none" onClick={() => setPreviewModalImage(null)}>
          <div className="relative max-h-[90vh] max-w-[90vw] [&_img]:max-h-[90vh] [&_img]:max-w-full [&_img]:rounded-sm [&_img]:object-contain [&_img]:shadow-[0_15px_50px_rgb(0_0_0_/_0.5)]" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="absolute -top-10 -end-10 flex size-8 cursor-pointer items-center justify-center rounded-full border-none bg-card text-lg text-text-main transition-transform duration-200 hover:scale-110 motion-reduce:hover:scale-100 max-md:end-0" onClick={() => setPreviewModalImage(null)} aria-label={t("form.closePreview")}>✕</button>
            <img src={previewModalImage} alt={t("form.previewAlt")} decoding="async" />
          </div>
        </div>
      )}
    </form>
  );
};
