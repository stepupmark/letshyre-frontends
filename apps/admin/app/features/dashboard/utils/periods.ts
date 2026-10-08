const pad = (value: number) => String(value).padStart(2, "0");

const isoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function paymentsUrl(from?: Date, to?: Date) {
  const params = new URLSearchParams({ status: "Success" });
  if (from) params.set("from", isoDate(from));
  if (to) params.set("to", isoDate(to));
  return `/dashboard/payments?${params}`;
}

export function monthRange(year: number, month: number) {
  return { from: new Date(year, month, 1), to: new Date(year, month + 1, 0) };
}

export function startOfWeek(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}
