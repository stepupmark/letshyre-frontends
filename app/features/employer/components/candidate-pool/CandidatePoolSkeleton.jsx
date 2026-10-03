/**
 * CandidatePoolSkeleton — loading states that mirror the real layout.
 *
 * Employs design engineering (Emil Kowalski) & animation vocabulary principles:
 * - Perceived performance via interactive AI status ticker
 * - Staggered row entrances (60ms interval) for cascading rhythm
 * - Depth opacity grading across scanning rows
 * - Zero layout shift against real ScanRow & ScoreRing geometry
 *
 * @param {"jobs"|"candidates"} variant
 * @param {string} [jobTitle] - shown in the scan strip
 */
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const AI_SCAN_STEP_KEYS = ["step1", "step2", "step3", "step4"];

/** Static score ring placeholder — same geometry as the real ScoreRing, without distracting rotation. */
const ScanRing = () => (
  <div className="relative size-12 shrink-0 rounded-full" aria-hidden="true">
    <svg viewBox="0 0 56 56" className="size-12">
      <circle className="fill-none stroke-neutral-200/80 stroke-[4]" cx="28" cy="28" r="22" />
      <circle
        className="fill-none stroke-brand-400/60 stroke-[4] [stroke-linecap:round] [stroke-dasharray:45_100]"
        cx="28"
        cy="28"
        r="22"
      />
    </svg>
  </div>
);

const AIStatusTicker = ({ jobTitle }) => {
  const { t } = useTranslation("employerCandidates");
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReducedMotion) return;

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % AI_SCAN_STEP_KEYS.length);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="my-2.5 mb-5 flex w-full max-w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border border-brand-200/80 bg-linear-to-b from-brand-50/50 to-card px-4 py-9 text-brand-700 shadow-sm sm:px-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-2.5 text-center sm:flex-row sm:gap-3">
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-brand-200/80 bg-card px-3 py-1 shadow-2xs">
          <Sparkles size={16} className="shrink-0 animate-spark text-brand-600 motion-reduce:animate-none" aria-hidden="true" />
          <span className="text-xs font-semibold tracking-wide text-brand-700 uppercase">{t("pool.scan.aiMatcher")}</span>
        </div>
        {jobTitle && (
          <span
            className="max-w-full truncate rounded-md border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-sm font-bold text-brand-800 shadow-2xs"
            title={jobTitle}
          >
            {jobTitle}
          </span>
        )}
      </div>

      <div className="min-h-[24px] px-2 text-center text-sm font-medium text-brand-900 sm:text-base">
        <span className="inline-block transition-opacity duration-300">
          {t(`pool.scan.${AI_SCAN_STEP_KEYS[stepIndex]}`)}
        </span>
      </div>

      <span className="relative h-1.5 w-64 max-w-[85%] overflow-hidden rounded-full bg-brand-100 shadow-inner" aria-hidden="true">
        <span className="absolute inset-0 w-2/5 animate-scan-slide rounded-full bg-linear-90 from-brand-400 via-brand-500 to-brand-600 motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-50" />
      </span>
    </div>
  );
};

const ScanRow = ({ index = 0 }) => {
  const opacityLevels = [
    "opacity-100",
    "opacity-95",
    "opacity-90",
    "opacity-85",
    "opacity-75",
  ];
  const rowOpacity = opacityLevels[index % opacityLevels.length] || "opacity-75";

  return (
    <div
      className={cn(
        "cp-row-areas grid lg:grid-cols-[minmax(220px,1fr)_84px_84px_84px_84px_84px_100px] cursor-default items-center gap-5 p-5 transition-colors duration-200 [&+&]:border-t [&+&]:border-border max-lg:items-start max-lg:gap-x-4 max-lg:gap-y-3 max-lg:rounded-lg max-lg:border max-lg:border-border max-lg:bg-card max-lg:p-4 max-lg:shadow-sm",
        rowOpacity
      )}
      style={{
        animationDelay: `${index * 60}ms`,
      }}
      aria-hidden="true"
    >
      <div className={cn("min-w-0", "flex min-w-0 items-start gap-3 max-lg:[grid-area:identity]")}>
        <Skeleton className="size-10.5 shrink-0 rounded-md bg-neutral-200/70" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.75">
          <Skeleton className="h-3.25 w-[45%] bg-neutral-200/80" />
          <Skeleton className="h-2.75 w-[70%] bg-neutral-100" />
        </div>
      </div>

      <div className={cn("min-w-0", "flex justify-center max-lg:[grid-area:ai] max-lg:justify-self-end")}>
        <ScanRing />
      </div>

      <div className="contents max-lg:[grid-area:stats] max-lg:flex max-lg:flex-wrap max-lg:items-center max-lg:gap-x-4 max-lg:gap-y-2">
        {[...Array(4)].map((_, i) => (
          <div className={cn("min-w-0", "text-center max-lg:inline-flex max-lg:items-baseline max-lg:gap-1.25 max-lg:text-start max-lg:text-xs max-lg:text-neutral-500 max-lg:before:content-[attr(data-label)]")} key={i}>
            <div className={cn("skeleton-shimmer-brand", "mx-auto h-3.25 w-9 max-lg:mx-0", "rounded-sm")} />
          </div>
        ))}
      </div>

      <div className={cn("min-w-0", "flex justify-end max-lg:[grid-area:action]")}>
        <Skeleton className="h-8 w-17.5 rounded-md bg-neutral-200/70" />
      </div>
    </div>
  );
};

export const CandidatePoolSkeleton = ({ variant, jobTitle }) => {
  const { t } = useTranslation("employerCandidates");
  if (variant === "jobs") {
    return (
      <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-2" aria-busy="true" aria-label={t("pool.loadingJobs")}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={cn("flex w-58 flex-none cursor-default flex-col gap-2 rounded-lg border border-border bg-card px-4 py-3 shadow-sm transition-[border-color,box-shadow,transform] duration-200")}>
            <Skeleton className="h-3.5 w-[75%]" />
            <div className="flex gap-1.5">
              <Skeleton className="h-2.75 w-14" />
              <Skeleton className="h-2.75 w-14" />
            </div>
            <div className="flex gap-1.5">
              <Skeleton className="h-2.75 w-10" />
              <Skeleton className="h-2.75 w-10" />
              <Skeleton className="h-2.75 w-10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "candidates") {
    return (
      <div className="flex flex-col gap-3">
        <AIStatusTicker jobTitle={jobTitle} />

        <div
          className="overflow-hidden rounded-lg border border-border bg-card shadow-sm max-lg:flex max-lg:flex-col max-lg:gap-4 max-lg:overflow-visible max-lg:rounded-none max-lg:border-0 max-lg:bg-transparent max-lg:shadow-none"
          aria-busy="true"
        >
          {[...Array(5)].map((_, i) => (
            <ScanRow key={i} index={i} />
          ))}
        </div>
      </div>
    );
  }

  return null;
};
