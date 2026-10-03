export const roundScore = (value) => Math.round(Number(value) || 0);

/** Deterministic avatar fallback when no profile photo is set. */
export const shareAvatarFallback = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Candidate")}&background=a8c8f9&color=fff&size=200`;

// Score bands drive the color used across the report's various progress
// bars and score chips, so a 92 and a 31 never read as visually the same.
export const scoreTone = (value) => {
  const score = roundScore(value);
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "danger";
};

const SECTION_ORDER = ["mcq", "pseudocode_mcq", "coding", "typing", "audio"];

/** section_summary is a keyed object; sorts it into a stable display order and drops zero-count sections. */
export const sectionSummaryList = (sectionSummary) => {
  if (!sectionSummary) return [];
  return SECTION_ORDER.filter((key) => sectionSummary[key]?.count > 0).map((key) => ({
    key,
    ...sectionSummary[key],
  }));
};
