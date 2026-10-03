import { formatDateFor, formatCurrencyFor } from "@/i18n/format";

/**
 * Safely unwraps a field that may arrive as an array, a JSON-encoded string,
 * or null. Always returns an array so callers can map without guards.
 */
export const parseField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

/**
 * CTC values from the API are already expressed in LPA (e.g. 12.0 == 12 LPA),
 * so we render them as "₹ 12 LPA" rather than running them through a currency
 * formatter as a literal rupee amount (which would wrongly show ₹12).
 */
export const formatLpa = (value, locale) => {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  const amount = formatCurrencyFor(locale, num, "INR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  return `${amount} LPA`;
};

/**
 * Renders total years of experience, e.g. "2.2 Years" / "0 Years".
 * `t` is bound to the "candidateProfile" namespace by callers.
 */
export const formatExperience = (years, t) => {
  if (years === null || years === undefined || years === "") return "—";
  const num = Number(years);
  if (Number.isNaN(num)) return "—";
  const clean = Number.isInteger(num) ? num : Number(num.toFixed(1));
  return t("units.years", { count: clean });
};

/**
 * Human-readable notice period derived from the last working day.
 * Returns "Immediate Joiner" when the date is today or already passed.
 * `t` is bound to the "candidateProfile" namespace by callers.
 */
export const getNoticePeriod = (lastDate, t) => {
  if (!lastDate) return t("units.notSpecified");
  const diff = Math.ceil(
    (new Date(lastDate) - new Date()) / (1000 * 60 * 60 * 24),
  );
  return diff <= 0 ? t("units.immediateJoiner") : t("units.days", { count: diff });
};

/** Formats an ISO date (YYYY-MM-DD) into a friendly "05 Jul 2025". */
export const formatDate = (value, locale) => {
  if (!value) return "—";
  const formatted = formatDateFor(locale, value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return formatted ?? value;
};

/** Deterministic avatar fallback when no profile photo is set. */
export const avatarFallback = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "User",
  )}&background=a8c8f9&color=fff&size=200`;
