import type { Marker, Shot } from "./product-shot"

// captured from apps/app with its e2e fixtures, at 2x, then encoded to AVIF and WebP
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

export const APPLICANT_MARKERS: readonly Marker[] = [
  [29, 38],
  [38, 41],
  [92, 50],
]
export const SCORECARD_MARKERS: readonly Marker[] = [
  [61, 8],
  [7, 62],
  [65, 62],
]
