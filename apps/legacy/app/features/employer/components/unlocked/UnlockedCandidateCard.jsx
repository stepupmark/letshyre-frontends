import { MapPin, ArrowRight, BadgeCheck, Clock, Briefcase } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { ShareLinkDialog } from "@/features/employer/components/scorecard-sharing/ShareLinkDialog";
import { cn } from "@/lib/utils";
import { useFormatters } from "@/i18n/format";

/** Ring colour is chosen from the score at runtime, so this stays a map. */
const UC_SCORE_RING_TONE = {
  high: "stroke-success",
  medium: "stroke-warning",
  low: "stroke-danger",
};


/** Initials fallback for the avatar. */
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() || "?";
};

/** Primary role — prefer the tech-experience title, fall back to latest job. */
const deriveRole = (c) => {
  const te = c.candidate_tech_experience;
  if (te && typeof te === "object") {
    const keys = Object.keys(te);
    if (keys.length) return keys[0];
  }
  const exp = c.candidate_experience;
  if (Array.isArray(exp) && exp[0]?.role) return exp[0].role;
  return null;
};

const formatExp = (v, t) => {
  const n = parseFloat(v);
  if (!n || Number.isNaN(n)) return null;
  const rounded = Number.isInteger(n) ? n : Math.round(n * 10) / 10;
  return t("unlocked.card.yr", { count: rounded });
};

/** SVG circular progress ring for the overall AI score. */
const ScoreRing = ({ score, t }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const value = Math.min(Math.max(Math.round(score || 0), 0), 100);
  const offset = circumference - (value / 100) * circumference;

  let tone = UC_SCORE_RING_TONE.low;
  if (value >= 70) tone = UC_SCORE_RING_TONE.high;
  else if (value >= 40) tone = UC_SCORE_RING_TONE.medium;

  return (
    <div
      className="relative size-13 shrink-0 max-lg:[grid-area:score] max-lg:justify-self-end"
      title={t("unlocked.card.overallScoreTitle")}
      aria-label={t("unlocked.card.overallScoreAria", { value })}
    >
      <svg viewBox="0 0 56 56" className="size-13 -rotate-90" aria-hidden="true">
        <circle className="fill-none stroke-neutral-100 stroke-[4]" cx="28" cy="28" r={radius} />
        <circle
          className={cn("fill-none stroke-[4] [stroke-linecap:round] transition-[stroke-dashoffset] duration-800 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none", tone)}
          cx="28"
          cy="28"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-text-body">{value}</span>
    </div>
  );
};

export const UnlockedCandidateCard = ({ candidate }) => {
  const { t } = useTranslation("employerCandidates");
  const { formatDateShort, formatCurrency } = useFormatters();
  const role = deriveRole(candidate);
  const exp = formatExp(candidate.candidate_total_experience_years, t);

  const cur = candidate.candidate_current_ctc;
  const expected = candidate.candidate_expected_ctc;
  const hasCtc = cur != null || expected != null;

  const unlockDate = formatDateShort(candidate.unlocked_date);

  // CTC values are LPA multipliers (e.g. 12), not literal rupee amounts —
  // format only the number/symbol, the "LPA" suffix is added by the caller.
  const formatCtc = (value) =>
    formatCurrency(value, "INR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  return (
    <article className="uc-row-areas grid lg:grid-cols-[minmax(190px,1.2fr)_minmax(90px,auto)_minmax(150px,1.1fr)_minmax(120px,auto)_auto_auto] items-center gap-5 px-5 py-4 transition-colors duration-200 [&+&]:border-t [&+&]:border-border [@media(hover:hover)_and_(pointer:fine)]:hover:bg-bg-subtle max-lg:items-start max-lg:gap-x-4 max-lg:gap-y-3 max-lg:rounded-lg max-lg:border max-lg:border-border max-lg:bg-card max-lg:p-4 max-lg:shadow-sm">
      {/* Identity */}
      <div className="flex min-w-0 items-center gap-3 max-lg:[grid-area:identity]">
        <div className="relative shrink-0">
          {candidate.candidate_profile_photo ? (
            <img
              src={candidate.candidate_profile_photo}
              alt={t("unlocked.card.photoAlt", { name: candidate.candidate_name || t("pool.row.candidate") })}
              className="size-12 rounded-md border border-border object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling.style.display = "flex";
              }}
            />
          ) : null}
          {/* Hidden while the photo is expected to load. The img's onError
              sets `style.display = "flex"` imperatively, and an inline style
              beats the class, so the fallback still appears on a dead URL. */}
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-md bg-brand-500 text-base font-bold text-text-white",
              candidate.candidate_profile_photo && "hidden",
            )}
          >
            {getInitials(candidate.candidate_name)}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="m-0 overflow-hidden text-base font-semibold tracking-tight text-ellipsis whitespace-nowrap text-text-body" title={candidate.candidate_name}>
              {candidate.candidate_name || t("unlocked.card.unnamed")}
            </h3>
            {candidate.candidate_is_verified && (
              <span className="inline-flex shrink-0 text-brand-500" title={t("unlocked.card.verifiedTitle")}>
                <BadgeCheck size={15} aria-label={t("unlocked.card.verified")} />
              </span>
            )}
          </div>
          {role && <p className="mt-0.75 mb-0 overflow-hidden text-xs font-medium text-ellipsis whitespace-nowrap text-text-muted">{role}</p>}
        </div>
      </div>

      {/* Experience + location (own columns on desktop, regrouped on mobile) */}
      <div className="contents max-lg:[grid-area:meta] max-lg:flex max-lg:flex-wrap max-lg:items-center max-lg:gap-x-4 max-lg:gap-y-2">
        <div className={cn("flex min-w-0 items-center gap-1.5 text-xs text-neutral-500 [&_svg]:shrink-0 [&_svg]:text-neutral-400 [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:whitespace-nowrap", "tabular-nums whitespace-nowrap")}>
          <Briefcase size={14} aria-hidden="true" />
          <span>{exp ? t("unlocked.card.exp", { value: exp }) : t("unlocked.card.expNa")}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-neutral-500 [&_svg]:shrink-0 [&_svg]:text-neutral-400 [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:whitespace-nowrap">
          <MapPin size={14} aria-hidden="true" />
          <span title={candidate.candidate_location}>
            {candidate.candidate_location || t("unlocked.card.notSpecified")}
          </span>
        </div>
      </div>

      {/* Compensation + signals */}
      <div className="flex min-w-0 flex-col gap-1.25 max-lg:[grid-area:comp] max-lg:flex-row max-lg:flex-wrap max-lg:items-center max-lg:gap-x-4 max-lg:gap-y-2">
        {hasCtc && (
          <div className="inline-flex items-center gap-1 text-sm font-bold tabular-nums text-text-body [&_svg]:text-neutral-400">
            {cur != null && <span className="text-neutral-500">{formatCtc(cur)}</span>}
            {cur != null && expected != null && (
              <ArrowRight size={12} aria-hidden="true" />
            )}
            {expected != null && (
              <span className="text-brand-600">{formatCtc(expected)}</span>
            )}
            <span className="text-xs font-semibold tracking-wide text-neutral-400">LPA</span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
          {candidate.candidate_notice_period != null && (
            <span className="inline-flex items-center gap-0.75 rounded-full bg-warning-bg px-1.75 py-0.5 font-semibold text-warning">
              <Clock size={11} aria-hidden="true" />
              {t("unlocked.card.noticeDays", { count: candidate.candidate_notice_period })}
            </span>
          )}
          {unlockDate && (
            <span className="tabular-nums">{t("unlocked.card.unlockedOn", { date: unlockDate })}</span>
          )}
        </div>
      </div>

      {/* Score */}
      <ScoreRing score={candidate.ai_overall_score} t={t} />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 max-lg:[grid-area:actions]">
        <ShareLinkDialog candidate={candidate} />
        <Link
          to={`/employer/employee-profile?id=${candidate.id}`}
          prefetch="intent"
          className={cn("inline-flex cursor-pointer items-center justify-center gap-1.25 rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap no-underline transition-[background-color,color,transform] duration-150 active:scale-97 motion-reduce:active:scale-100 max-lg:flex-1 max-lg:px-3.5 max-lg:py-2.5", "bg-brand-100 text-brand-700 hover:bg-brand-200 hover:text-brand-700")}
        >
          {t("unlocked.card.profile")}
        </Link>
        <Link
          to={`/employer/employee-score-card?id=${candidate.id}`}
          prefetch="intent"
          className={cn("inline-flex cursor-pointer items-center justify-center gap-1.25 rounded-md px-3.5 py-2 text-xs font-semibold whitespace-nowrap no-underline transition-[background-color,color,transform] duration-150 active:scale-97 motion-reduce:active:scale-100 max-lg:flex-1 max-lg:px-3.5 max-lg:py-2.5", "bg-brand-600 text-text-white hover:bg-brand-700 hover:text-text-white")}
        >
          {t("unlocked.card.scorecard")}
          <ArrowRight size={14} aria-hidden="true" className="rtl:-scale-x-100" />
        </Link>
      </div>
    </article>
  );
};
