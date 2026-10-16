export const PHASES = [
  { id: "join", chapters: ["account", "profile", "documents"] },
  { id: "prepare", chapters: ["app", "checks", "role"] },
  { id: "interview", chapters: ["interview", "after"] },
] as const

export const CHAPTERS = PHASES.flatMap((phase) => phase.chapters)

export type ChapterId = (typeof PHASES)[number]["chapters"][number]

/** Readable, shareable anchors; the app links to some of them. Keep them stable once published. */
export const CHAPTER_ANCHORS: Record<ChapterId, string> = {
  account: "create-your-account",
  profile: "build-your-profile",
  documents: "add-your-documents",
  app: "get-the-desktop-app",
  checks: "pass-the-checks",
  role: "choose-your-role",
  interview: "take-your-interview",
  after: "after-your-interview",
}

export const CHAPTER_STEPS = {
  account: ["start", "mobile", "password", "onboard"],
  profile: ["about", "photo", "work", "places"],
  documents: ["letters", "proof", "resume", "pick", "review"],
  app: ["computer", "download", "signIn", "take"],
  checks: ["security", "permissions", "face", "voice"],
  role: ["keep", "change", "commit"],
  interview: ["rules", "timer", "answer", "finish"],
  after: ["scorecard", "matched", "apply", "unlocked"],
} as const satisfies Record<ChapterId, readonly string[]>

export const READY_ITEMS = [
  "contact",
  "aadhaar",
  "photo",
  "letters",
  "resume",
  "computer",
] as const

export const FAQ_IDS = [
  "age",
  "aadhaar",
  "documents",
  "attempts",
  "device",
  "voice",
  "strikes",
  "internet",
  "role",
  "edit",
  "unlock",
] as const

export const READY_ANCHOR = "what-to-keep-ready"
export const REQUIREMENTS_ANCHOR = "what-you-need"
export const RULES_ANCHOR = "what-ends-an-interview"
export const FAQ_ANCHOR = "questions"

export const ANCHORS = [
  READY_ANCHOR,
  ...CHAPTERS.map((id) => CHAPTER_ANCHORS[id]),
  FAQ_ANCHOR,
]
