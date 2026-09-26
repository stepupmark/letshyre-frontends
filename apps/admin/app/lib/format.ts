const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const currencyFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const numberFormat = new Intl.NumberFormat("en-IN");

function toDate(value: string | number | Date | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | Date | null | undefined) {
  const date = toDate(value);
  return date ? dateFormat.format(date) : "—";
}

export function formatDateTime(value: string | Date | null | undefined) {
  const date = toDate(value);
  return date ? dateTimeFormat.format(date) : "—";
}

export function formatCurrency(
  value: number | string | null | undefined,
  currency?: string | null,
) {
  const amount = Number(value);
  if (value === null || value === undefined || value === "" || isNaN(amount))
    return "—";
  if (!currency || currency === "INR") return currencyFormat.format(amount);
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function formatNumber(value: number | string | null | undefined) {
  const n = Number(value);
  return value === null || value === undefined || Number.isNaN(n)
    ? "—"
    : numberFormat.format(n);
}

/** Keeps the last few characters visible, e.g. "XXXX XXXX 1234". */
export function maskId(value: string | null | undefined, visible = 4) {
  const clean = value?.replace(/\s+/g, "") ?? "";
  if (!clean) return "—";
  if (clean.length <= visible) return clean;
  return `${"•".repeat(clean.length - visible)}${clean.slice(-visible)}`;
}

export function initials(name: string | null | undefined, fallback = "?") {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return parts.length
    ? parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : fallback;
}

/** ISO string to the local "YYYY-MM-DDTHH:mm" value a datetime-local input expects. */
export function toDateTimeLocal(value: string | null | undefined) {
  const date = toDate(value);
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
