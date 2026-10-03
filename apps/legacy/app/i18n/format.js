import { useMemo } from "react";
import { useAppLocale } from "@/i18n/appLocale";

// Intl.DateTimeFormat/NumberFormat construction is the expensive part of
// formatting — cache instances by locale (+ options) so repeated calls,
// across renders and across components, reuse the same instance.
const dateFormatterCache = new Map();
const numberFormatterCache = new Map();

const getDateTimeFormat = (locale, opts) => {
  const key = `${locale}|${JSON.stringify(opts || {})}`;
  let formatter = dateFormatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, opts);
    dateFormatterCache.set(key, formatter);
  }
  return formatter;
};

const getNumberFormat = (locale, opts) => {
  const key = `${locale}|${JSON.stringify(opts || {})}`;
  let formatter = numberFormatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, opts);
    numberFormatterCache.set(key, formatter);
  }
  return formatter;
};

export const formatDateFor = (locale, value, opts) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return getDateTimeFormat(locale, opts).format(d);
};

export const formatDateShortFor = (locale, value) =>
  formatDateFor(locale, value, { month: "short", day: "numeric" });

export const formatDateLongFor = (locale, value) =>
  formatDateFor(locale, value, { month: "short", day: "numeric", year: "numeric" });

export const formatNumberFor = (locale, value) =>
  getNumberFormat(locale).format(value);

export const formatCurrencyFor = (locale, value, currencyCode = "INR", opts) =>
  getNumberFormat(locale, { style: "currency", currency: currencyCode, ...opts }).format(value);

// Symbol only (e.g. "₹"), for values that aren't a literal amount in
// `currencyCode` — an LPA multiplier next to a "LPA" suffix, say — but
// whose currency glyph should still follow the locale.
export const formatCurrencySymbolFor = (locale, currencyCode = "INR") => {
  const parts = getNumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).formatToParts(0);
  const symbol = parts.find((p) => p.type === "currency");
  return symbol ? symbol.value : currencyCode;
};

export function useFormatters() {
  const { locale } = useAppLocale();

  return useMemo(
    () => ({
      formatDate: (value, opts) => formatDateFor(locale, value, opts),
      formatDateShort: (value) => formatDateShortFor(locale, value),
      formatDateLong: (value) => formatDateLongFor(locale, value),
      formatNumber: (value) => formatNumberFor(locale, value),
      formatCurrency: (value, currencyCode = "INR", opts) =>
        formatCurrencyFor(locale, value, currencyCode, opts),
      formatCurrencySymbol: (currencyCode = "INR") =>
        formatCurrencySymbolFor(locale, currencyCode),
    }),
    [locale],
  );
}
