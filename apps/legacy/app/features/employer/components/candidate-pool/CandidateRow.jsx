// One AI-matched candidate as a dense, rankable row. Desktop: numeric cells
// align into scannable columns. Mobile: the same data reflows into a stacked card.
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Ring colour is chosen from the score at runtime, so this stays a map.
const CP_SCORE_RING_TONE = {
  high: "stroke-success",
  medium: "stroke-warning",
  low: "stroke-danger",
};


// text-brand-100 on bg-brand-600 is intentional — a pale blue, not white.
const VIEW_BUTTON_CLASS =
  "h-auto gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-brand-100 hover:bg-brand-700 active:scale-97 motion-reduce:active:scale-100 max-lg:w-full max-lg:justify-center max-lg:px-3.5 max-lg:py-2.5";

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() || "?";
};

const toneFor = (value) => {
  if (value >= 70) return CP_SCORE_RING_TONE.high;
  if (value >= 40) return CP_SCORE_RING_TONE.medium;
  return CP_SCORE_RING_TONE.low;
};

// SVG circular progress ring for the AI match score.
export const ScoreRing = ({ score, t }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const value = Math.min(Math.max(Math.round(score || 0), 0), 100);
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative size-12 shrink-0" aria-label={t ? t("pool.row.aiScoreAria", { value }) : `AI match score: ${value} percent`}>
      <svg viewBox="0 0 56 56" className="size-12 -rotate-90" aria-hidden="true">
        <circle className="fill-none stroke-neutral-100 stroke-[4]" cx="28" cy="28" r={radius} />
        <circle
          className={cn("fill-none stroke-[4] [stroke-linecap:round] transition-[stroke-dashoffset] duration-800 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none", toneFor(value))}
          cx="28"
          cy="28"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums text-text-body">{value}</span>
    </div>
  );
};

const num = (v) => (v == null ? "—" : Math.round(v));

export const CandidateRow = ({ candidate, rank, onViewProfile }) => {
  const { t } = useTranslation("employerCandidates");
  const aiMatch = candidate?.ai_match || {};
  const score = aiMatch.ai_matching_score ?? candidate?.score ?? 0;
  const interviews = candidate?.interview_attempts || [];
  const years = aiMatch.years_experience;
  const isTop = rank === 1;

  const open = () => onViewProfile?.(candidate.candidate_id);

  return (
    <article
      className={cn("cp-row-areas grid lg:grid-cols-[minmax(220px,1fr)_84px_84px_84px_84px_84px_100px] cursor-pointer items-center gap-5 p-5 transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-400 [&+&]:border-t [&+&]:border-border [@media(hover:hover)_and_(pointer:fine)]:hover:bg-bg-subtle max-lg:items-start max-lg:gap-x-4 max-lg:gap-y-3 max-lg:rounded-lg max-lg:border max-lg:border-border max-lg:bg-card max-lg:p-4 max-lg:shadow-sm", isTop && "inset-ring-[3px] inset-ring-transparent shadow-[inset_3px_0_0_var(--color-brand-500)] max-lg:border-brand-500 max-lg:shadow-sm")}
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      aria-label={t("pool.row.viewProfileAria", { name: candidate.candidate_name || t("pool.row.candidate") })}
    >
      {/* Identity */}
      <div className={cn("min-w-0", "flex min-w-0 items-start gap-3 max-lg:[grid-area:identity]")}>
        <div className="relative shrink-0">
          {candidate.profile_photo_url ? (
            <img
              className="size-10.5 rounded-md border border-border object-cover"
              src={candidate.profile_photo_url}
              alt={t("unlocked.card.photoAlt", { name: candidate.candidate_name || t("pool.row.candidate") })}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling.style.display = "flex";
              }}
            />
          ) : null}
          {/* onError shows this via inline display:flex (beats `hidden`), so a
              dead photo URL falls back to initials. */}
          <div
            className={cn(
              "flex size-10.5 items-center justify-center rounded-md bg-brand-500 text-sm font-bold text-text-white",
              candidate.profile_photo_url && "hidden",
            )}
            aria-hidden="true"
          >
            {getInitials(candidate.candidate_name)}
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="m-0 overflow-hidden text-sm font-semibold tracking-tight text-ellipsis whitespace-nowrap text-text-body" title={candidate.candidate_name}>
            {candidate.candidate_name || t("pool.row.unknown")}
          </h3>
          <p className="mt-0.5 mb-0 overflow-hidden text-xs font-medium text-ellipsis whitespace-nowrap text-text-muted">{aiMatch.role_applied || t("pool.row.dash")}</p>
          {aiMatch.rationale && (
            <p className="mt-1.25 mb-0 text-xs leading-normal text-neutral-500 line-clamp-3" title={aiMatch.rationale}>
              {aiMatch.rationale}
            </p>
          )}
        </div>
      </div>

      {/* AI score */}
      <div className={cn("min-w-0", "flex justify-center max-lg:[grid-area:ai] max-lg:justify-self-end")}>
        <ScoreRing score={score} t={t} />
      </div>

      {/* Numeric cells — own columns on desktop, regrouped inline on mobile */}
      <div className="contents max-lg:[grid-area:stats] max-lg:flex max-lg:flex-wrap max-lg:items-center max-lg:gap-x-4 max-lg:gap-y-2">
        <div className={cn("min-w-0", "text-center max-lg:inline-flex max-lg:items-baseline max-lg:gap-1.25 max-lg:text-start max-lg:text-xs max-lg:text-neutral-500 max-lg:before:content-[attr(data-label)]")} data-label={t("pool.columns.roleMatch")}>
          <span className="text-sm font-semibold tabular-nums text-text-body">{num(aiMatch.role_match_score)}</span>
        </div>
        <div className={cn("min-w-0", "text-center max-lg:inline-flex max-lg:items-baseline max-lg:gap-1.25 max-lg:text-start max-lg:text-xs max-lg:text-neutral-500 max-lg:before:content-[attr(data-label)]")} data-label={t("pool.columns.skillsMatch")}>
          <span className="text-sm font-semibold tabular-nums text-text-body">{num(aiMatch.skills_match_score)}</span>
        </div>
        <div className={cn("min-w-0", "text-center max-lg:inline-flex max-lg:items-baseline max-lg:gap-1.25 max-lg:text-start max-lg:text-xs max-lg:text-neutral-500 max-lg:before:content-[attr(data-label)]")} data-label={t("pool.columns.interviews")}>
          <span className="text-sm font-semibold tabular-nums text-text-body">{interviews.length}</span>
        </div>
        <div className={cn("min-w-0", "text-center max-lg:inline-flex max-lg:items-baseline max-lg:gap-1.25 max-lg:text-start max-lg:text-xs max-lg:text-neutral-500 max-lg:before:content-[attr(data-label)]")} data-label={t("pool.columns.experience")}>
          <span className="text-sm font-semibold tabular-nums text-text-body">{years != null ? t("pool.row.expYears", { count: years }) : t("pool.row.dash")}</span>
        </div>
      </div>

      {/* Action */}
      <div className={cn("min-w-0", "flex justify-end max-lg:[grid-area:action]")}>
        <Button
          className={VIEW_BUTTON_CLASS}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          aria-label={t("pool.row.viewAria", { name: candidate.candidate_name || t("pool.row.candidate") })}
        >
          {t("pool.row.view")} <ArrowRight size={14} aria-hidden="true" className="rtl:-scale-x-100" />
        </Button>
      </div>
    </article>
  );
};
