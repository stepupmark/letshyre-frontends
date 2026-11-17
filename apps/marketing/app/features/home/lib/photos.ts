// the two exported widths and the larger one's height, as public/images holds them
const PHOTOS = {
  "home/hero": [600, 960, 960],
  "home/her-break": [960, 1200, 670],
  "home/her-desk": [960, 1200, 896],
  "home/live-interview": [960, 1200, 896],
  "home/post-a-job": [960, 1200, 670],
  "home/reach-out": [960, 1200, 670],
  "home/resume-pile": [960, 1200, 896],
  "home/review-interview": [960, 1200, 670],
  "home/shortlist": [960, 1200, 670],
  "home/team-review": [960, 1200, 896],
  "home/unlock-podium": [960, 1200, 675],
} as const

export type PhotoName = keyof typeof PHOTOS

export const photoSize = (name: PhotoName) => {
  const [, width, height] = PHOTOS[name]
  return { width, height }
}

export const photoSrcSet = (name: PhotoName, type: "avif" | "webp") => {
  const [small, large] = PHOTOS[name]
  return `/images/${name}-${small}.${type} ${small}w, /images/${name}-${large}.${type} ${large}w`
}

export const HERO_SIZES = [
  "(min-width: 80rem) 32rem",
  "(min-width: 64rem) 28rem",
  "24rem",
].join(", ")

// the hero photo leads the first screen only where scenes pin; keep in step with `pin` in app.css
export const heroPreload = () => [
  {
    rel: "preload",
    as: "image",
    type: "image/avif",
    href: `/images/home/hero-${PHOTOS["home/hero"][1]}.avif`,
    imageSrcSet: photoSrcSet("home/hero", "avif"),
    imageSizes: HERO_SIZES,
    media: [
      "(min-width: 64rem)",
      "(min-height: 42rem)",
      "(prefers-reduced-motion: no-preference)",
    ].join(" and "),
  },
]
