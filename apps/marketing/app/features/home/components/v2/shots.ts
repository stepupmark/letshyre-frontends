import type { Shot, Spot } from "./product-shot"

// captured from apps/app with its e2e fixtures at 2x, then encoded to AVIF and WebP
export const APPLICANTS: Shot = {
  src: "/images/home-v2/applicants",
  width: 1440,
  height: 966,
}
export const SCORECARD: Shot = {
  src: "/images/home-v2/scorecard",
  width: 1440,
  height: 748,
}
export const MY_SCORECARDS: Shot = {
  src: "/images/home-v2/my-scorecards",
  width: 1440,
  height: 756,
}

export const APPLICANT_SPOTS: readonly Spot[] = [
  [31, 36, 8, 59],
  [39.5, 36, 31.5, 59],
  [80, 43, 15.5, 50],
]
export const SCORECARD_SPOTS: readonly Spot[] = [
  [59.5, 7, 35, 28],
  [6.5, 61, 57.5, 32],
  [64.5, 61, 28.5, 32],
]
