import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Panel } from "@/components/common/Panel";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Animated circular progress ring for the profile completion score. */
function CompletionRing({ score }) {
  const { t } = useTranslation("candidateProfile");
  const target = Math.max(0, Math.min(100, score ?? 0));
  const reduceMotion = useReducedMotion();
  const [animated, setAnimated] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (reduceMotion) return undefined;
    let current = 0;
    const step = () => {
      current = Math.min(current + 2, target);
      setAnimated(current);
      if (current < target) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, reduceMotion]);

  const value = reduceMotion ? target : animated;
  const offset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;

  return (
    <div className="relative size-30">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
        <circle className="fill-none stroke-brand-100 stroke-[10]" cx="60" cy="60" r={RADIUS} />
        <circle
          className="fill-none stroke-brand-500 stroke-[10] [stroke-linecap:round] transition-[stroke-dashoffset] duration-150 ease-linear motion-reduce:transition-none"
          cx="60"
          cy="60"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-text-main">{value}%</span>
        <span className="text-xs text-text-muted">{t("completion.complete")}</span>
      </div>
    </div>
  );
}

/** Profile completion card — ring + a short perspective-specific note. */
export function CompletionCard({ score, perspective = "self" }) {
  const { t } = useTranslation("candidateProfile");
  const complete = (score ?? 0) >= 100;
  // Note text by perspective: the candidate viewing their own profile ("self")
  // vs an employer viewing an unlocked candidate ("candidate").
  const suffix = perspective === "candidate" ? "Candidate" : "";
  const note = t(
    complete
      ? `completion.noteComplete${suffix}`
      : `completion.noteIncomplete${suffix}`,
  );
  return (
    <Panel className="flex flex-col items-center text-center">
      <h2 className="mt-0 mb-4 text-base font-bold text-text-main">{t("completion.heading")}</h2>
      <div className="flex flex-col items-center gap-3">
        <CompletionRing score={score} />
        <p className="m-0 text-xs text-text-muted">{note}</p>
      </div>
    </Panel>
  );
}

// AI interviews used / remaining.
export function InterviewsCard({ used, max }) {
  const { t } = useTranslation("candidateProfile");
  const total = max ?? 0;
  const remaining = Math.max(0, total - (used ?? 0));
  return (
    <Panel className="flex flex-col items-center text-center">
      <h2 className="mt-0 mb-4 text-base font-bold text-text-main">{t("interviews.heading")}</h2>
      <div className={cn("flex flex-col items-center gap-3", "min-h-30 justify-center")}>
        <span className="text-5xl leading-none font-bold text-brand-600">{used ?? 0}</span>
        <span className="mt-2 text-xs text-text-muted">
          {t("interviews.usage", { total, remaining })}
        </span>
      </div>
    </Panel>
  );
}
