import React from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { BIcon } from "@/components/icons/BootstrapIcons";

// Step rail: a `before` grey line and an `after` brand fill whose width is driven
// by `data-step` (the 80px offsets the 40px inset at each end so the fill spans
// between the first and last circle centres).
function ProfileStepper({ step }) {
  const { t } = useTranslation("employeeOnboarding");

  const steps = [
    { number: 1, label: t("stepper.identity") },
    { number: 2, label: t("stepper.photo") },
    { number: 3, label: t("stepper.jobPreferences") },
    { number: 4, label: t("stepper.resumeRole") },
    { number: 5, label: t("stepper.review") },
  ];

  return (
    <div
      className={cn(
        "relative mb-8 flex w-full justify-between px-2.5 max-md:mb-10 max-md:items-center max-md:px-0",
        "before:absolute before:top-[17px] before:end-10 before:start-10 before:z-0 before:h-0.5 before:rounded-sm before:bg-border before:content-['']",
        "after:absolute after:top-[17px] after:start-10 after:z-0 after:h-0.5 after:rounded-sm after:bg-brand-600 after:transition-[width] after:duration-400 after:ease-[ease] after:content-['']",
        "data-[step='1']:after:w-0",
        "data-[step='2']:after:w-[calc((100%-80px)*0.25)]",
        "data-[step='3']:after:w-[calc((100%-80px)*0.5)]",
        "data-[step='4']:after:w-[calc((100%-80px)*0.75)]",
        "data-[step='5']:after:w-[calc(100%-80px)]",
      )}
      data-step={step}
    >
      {steps.map((s) => {
        const isCompleted = step > s.number;
        const isActive = step === s.number;

        return (
          <div
            key={s.number}
            className="relative z-1 flex w-15 flex-col items-center text-center max-md:w-auto"
          >
            <div
              className={cn(
                "mb-2 flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 max-md:m-0 max-md:size-8 max-md:text-xs",
                isCompleted
                  ? "animate-pop-in border-success bg-success text-white motion-reduce:animate-none"
                  : isActive
                    ? "border-brand-600 bg-brand-600 text-white shadow-[0_0_0_4px_rgba(62,126,244,0.1)]"
                    : "border-neutral-300 bg-card text-neutral-400",
              )}
            >
              {isCompleted ? <BIcon name="check2" /> : s.number}
            </div>
            <span
              className={cn(
                "mt-2 text-sm font-semibold transition-all duration-300",
                isActive
                  ? "text-text-main max-md:absolute max-md:top-10 max-md:block max-md:w-max"
                  : "text-neutral-500 max-md:hidden",
              )}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default ProfileStepper;
