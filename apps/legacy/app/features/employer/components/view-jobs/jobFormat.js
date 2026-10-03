/**
 * Shared display formatters for employer job data. The API returns messy raw
 * values ("full_time", "on_site", "0 - 0 LPA", "0 - 0 years", null locations);
 * these normalize them once so both the list and the detail page stay clean.
 *
 * Each formatter that can emit human-readable copy takes the `t` function from
 * the `employer` namespace so callers stay language-agnostic.
 */

import { formatDateShortFor, formatDateLongFor } from "@/i18n/format";

export const formatDateShort = (value, locale) => formatDateShortFor(locale, value);

export const formatDate = (value, locale) => formatDateLongFor(locale, value);

export const formatSalary = (job, t) => {
  const min = job.salary_min_lpa;
  const max = job.salary_max_lpa;
  if (min != null && max != null && (min > 0 || max > 0)) {
    return min === max ? `${min} LPA` : `${min}–${max} LPA`;
  }
  const range = (job.salary_range || "").trim();
  if (range && !/^0\s*-\s*0\b/.test(range)) {
    return range.replace(/\s*-\s*/, "–");
  }
  return t("format.notDisclosed");
};

export const formatExperience = (job, t) => {
  const min = job.experience_min_years;
  const max = job.experience_max_years;
  if (min != null && max != null) {
    if (min === 0 && max === 0) return t("format.fresher");
    if (min === max) return t("format.yrs", { count: min });
    return t("format.yrsRange", { min, max });
  }
  const s = (job.experience_required || "").trim();
  if (s && !/^0\s*-\s*0\b/.test(s)) return s.replace(/\s*-\s*/, "–");
  return t("format.notSpecified");
};

const EMPLOYMENT = {
  full_time: "fullTime",
  part_time: "partTime",
  contract: "contract",
  internship: "internship",
  temporary: "temporary",
  freelance: "freelance",
};

export const formatEmployment = (value, t) => {
  if (!value) return null;
  const key = EMPLOYMENT[value];
  return key
    ? t(`format.employment.${key}`)
    : value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const WORK_MODE = {
  on_site: "onSite",
  onsite: "onSite",
  remote: "remote",
  hybrid: "hybrid",
};

export const formatWorkMode = (value, t) => {
  if (!value) return null;
  const key = WORK_MODE[value];
  return key ? t(`format.workMode.${key}`) : value.replace(/_/g, " ");
};

export const formatLocation = (job, t) => {
  if (job.location && job.location.trim()) return job.location.trim();
  const parts = [job.city, job.state, job.country].filter(Boolean);
  return parts.length ? parts.join(", ") : t("format.locationNotSpecified");
};

export const formatOpenings = (n, t) =>
  n > 0 ? t("format.opening", { count: n }) : null;

/**
 * Status pill metadata. Pending jobs (awaiting approval) get a badge only
 * where `includePending` is true — the list omits it, the detail page shows it.
 *
 * `cls` is kept alongside `tone` because the job-detail status <select> still
 * uses `.jd-status-select.status-*` from CSS — that control keeps its
 * hand-written rule for the data-URI chevron, so it needs the class too.
 */
const STATUS_TONE = {
  open: "border-success-bg bg-success-bg text-success",
  pending: "border-warning-bg bg-warning-bg text-warning",
  closed: "border-danger-bg bg-danger-bg text-danger",
  paused: "border-border bg-bg-subtle text-neutral-500",
};

export const getStatusMeta = (job, t, { includePending = true } = {}) => {
  const status = (job.status || job.approval_status || "").toLowerCase();
  switch (status) {
    case "open":
      return { label: t("format.status.open"), cls: "status-open", tone: STATUS_TONE.open };
    case "closed":
      return { label: t("format.status.closed"), cls: "status-closed", tone: STATUS_TONE.closed };
    case "paused":
      return { label: t("format.status.paused"), cls: "status-paused", tone: STATUS_TONE.paused };
    case "pending":
      return includePending
        ? { label: t("format.status.pending"), cls: "status-pending", tone: STATUS_TONE.pending }
        : null;
    default:
      return null;
  }
};
