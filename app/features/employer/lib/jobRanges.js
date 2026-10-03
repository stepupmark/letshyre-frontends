// Salary and experience are entered as numbers. The API also stores a text
// version, which the candidate screens show, so both post and edit build it
// here and always read the same.

const has = (value) => value !== undefined && value !== null && value !== "";

const rangeText = (min, max, separator, unit) => {
  if (has(min) && has(max)) return `${min}${separator}${max} ${unit}`;
  if (has(min)) return `${min} ${unit}`;
  if (has(max)) return `Up to ${max} ${unit}`;
  return "";
};

export const salaryText = (min, max) => rangeText(min, max, " - ", "LPA");
export const experienceText = (min, max) => rangeText(min, max, "-", "years");

// Reads the numbers back out of a stored text ("10 - 15 LPA", "Up to 5 years").
// Returns null when there are none, so the caller can keep the text as is.
export function parseRange(text) {
  const numbers = String(text ?? "").match(/\d+(?:\.\d+)?/g)?.map(Number);
  if (!numbers?.length) return null;
  if (/^\s*up to\b/i.test(text)) return { min: "", max: numbers[0] };
  return { min: numbers[0], max: numbers[1] ?? "" };
}
