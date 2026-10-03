import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import KYCImg from "@/assets/EmployerKYC.webp";
import brand from "@/assets/letshyre.webp";
import e_demo01 from "@/assets/emp-demo01.webp";
import e_demo02 from "@/assets/emp-demo02.webp";
import onboardingVideo from "@/assets/employer-onboarding-video.mp4";
import onboardingThumbnail from "@/assets/employer-onboarding-thumbnail.webp";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Lock,
  PlayCircle,
  ArrowRight,
  PartyPopper,
} from "lucide-react";

import { OnboardingForm } from "@/features/employer/components/onboarding/OnboardingForm";
import { cn } from "@/lib/utils";

// Each step owns its wrapper: the form's sub-1440px cap used to leak into the
// success card and squeeze its text column to ~170px.
const FORM_WRAPPER =
  "grid w-[85%] max-w-320 grid-cols-[1fr_2fr] items-center justify-center gap-5 rounded-lg bg-gradient-to-b from-white to-brand-300 p-5 2xl:grid-cols-[1fr_1.5fr] 3xl:max-w-360 4xl:max-w-400 max-xl:mt-5 max-xl:w-full max-xl:max-w-212.5 max-xl:grid-cols-1 max-xl:rounded-none max-xl:bg-none max-xl:p-0";
const SUCCESS_WRAPPER = "mt-20 w-full max-w-6xl max-2xl:mt-5";

// The form reaches its desktop layout at 1280px; the success screen keeps 1440px.
const PAGE = {
  1: "bg-gradient-to-b from-brand-400 to-card p-10 max-xl:bg-bg-subtle max-xl:bg-none max-xl:p-6 max-md:p-4 max-sm:bg-card max-sm:p-0",
  2: "bg-gradient-to-b from-brand-400 to-card p-10 max-2xl:bg-bg-subtle max-2xl:bg-none max-2xl:p-6 max-md:p-4 max-sm:bg-card max-sm:p-0",
};

const FEATURES = [
  { key: "candidates", Icon: Users, tone: "bg-brand-200 text-brand-600" },
  { key: "scorecards", Icon: FileText, tone: "bg-success-bg text-success" },
  { key: "unlock", Icon: Lock, tone: "bg-[#f3e8ff] text-[#9333ea]" },
];

export function EmployerOnboarding() {
  const { t } = useTranslation("onboarding");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleSkip = () => {
    navigate("/employer");
  };

  return (
    <div className={cn("relative flex min-h-screen items-center justify-center overflow-x-clip", PAGE[step])}>
      <img
        src={brand}
        className={cn(
          "absolute inset-x-0 top-5 z-0 w-full transition-transform duration-1000",
          step === 1 ? "max-xl:hidden" : "translate-y-7.5 max-2xl:hidden",
        )}
        alt=""
        loading="lazy"
        decoding="async"
      />

      <div
        className={cn(
          "relative z-2 mx-auto",
          step === 1 ? FORM_WRAPPER : SUCCESS_WRAPPER,
        )}
      >
        {step === 2 && (
          <>
            <img
              src={e_demo01}
              className={cn(
                "absolute -top-27.5 -left-20 z-10 w-42.5 opacity-0 animate-show-images max-2xl:hidden",
                "[animation-delay:0s]",
              )}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <img
              src={e_demo02}
              className={cn(
                "absolute -top-27.5 -left-20 z-10 w-42.5 opacity-0 animate-show-images max-2xl:hidden",
                "[animation-delay:2s]",
              )}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </>
        )}

        {step === 1 && (
          <div className="sticky top-10 self-start max-xl:hidden [&_img]:w-full [&_img]:max-w-112.5 3xl:[&_img]:max-w-140">
            <img
              src={KYCImg}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
        )}

        {step === 1 && (
          <div className="flex w-full flex-col rounded-xl border-2 border-brand-400 bg-card px-8 pt-8 shadow-[0_15px_40px_rgb(0_0_0_/_0.15)] 3xl:px-10 max-xl:rounded-lg max-xl:border-none max-xl:px-7.5 max-xl:pt-7.5 max-xl:shadow-[0_10px_40px_rgb(0_0_0_/_0.08)] max-md:px-5 max-md:pt-5 max-md:shadow-[0_4px_20px_rgb(0_0_0_/_0.08)] max-sm:rounded-none max-sm:px-4 max-sm:pt-6 max-sm:shadow-none">
            <h2 className="mb-6 text-center text-xl text-text-main sm:text-2xl xl:text-3xl 3xl:text-4xl">
              {t("step1.heading")}
            </h2>
            <OnboardingForm onNextStep={() => setStep(2)} />
          </div>
        )}

        {step === 2 && (
          <motion.div
            className="relative grid w-full items-center gap-10 rounded-lg bg-card p-10 shadow-[0_15px_40px_rgb(0_0_0_/_0.1)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] max-lg:gap-6 max-lg:text-center max-md:gap-5 max-md:px-4 max-md:py-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              className="min-w-0"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="relative w-full rounded-md [&_video]:block [&_video]:aspect-video [&_video]:w-full [&_video]:rounded-md [&_video]:object-cover">
                <video
                  src={onboardingVideo}
                  poster={onboardingThumbnail}
                  controls
                  className="onboarding-video"
                />
              </div>
            </motion.div>

            <motion.div
              className="flex min-w-0 flex-col items-start max-lg:order-first max-lg:items-center"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="mb-6 inline-flex items-center gap-1.5 rounded-sm bg-brand-100 px-3.5 py-1.5 text-sm font-bold tracking-[0.5px] uppercase text-brand-600">
                <PartyPopper size={13} /> {t("step2.badge")}
              </div>
              <h3 className="mb-4 text-3xl leading-[1.2] font-extrabold text-balance text-text-main">
                {t("step2.titlePrefix")}
                <span className="font-bold text-brand-400">
                  {t("step2.titleHighlight")}
                </span>
              </h3>
              <p className="mb-8 text-base leading-normal text-neutral-500">
                {t("step2.body")}
              </p>

              <div className="mb-8 flex w-full justify-between gap-4 rounded-lg bg-bg-subtle p-4">
                {FEATURES.map(({ key, Icon, tone }) => (
                  <div key={key} className="flex min-w-0 flex-1 flex-col items-center gap-3 text-center">
                    <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-full", tone)}>
                      <Icon size={20} />
                    </div>
                    <span className="max-w-full text-sm leading-[1.3] font-semibold text-balance break-words text-neutral-700">
                      {t(`step2.features.${key}`)}
                    </span>
                  </div>
                ))}
              </div>

              <button
                className="mb-4 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-md border-none bg-brand-600 px-6 py-4 text-base font-bold text-balance text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-[0_8px_20px_rgb(37_99_235_/_0.25)] motion-reduce:hover:translate-y-0"
                onClick={() => {
                  const video = document.querySelector(".onboarding-video");
                  if (video) video.play();
                }}
              >
                <PlayCircle size={20} className="shrink-0" /> {t("step2.watchWalkthrough")}
              </button>

              <button
                className="inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-base font-semibold text-brand-600 transition-opacity duration-200 hover:opacity-80"
                onClick={handleSkip}
              >
                {t("step2.skip")} <ArrowRight size={16} className="rtl:-scale-x-100" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
