export const CHAPTERS = [
  "account",
  "company",
  "post",
  "pool",
  "unlock",
  "review",
  "team",
] as const

export type ChapterId = (typeof CHAPTERS)[number]

/** Readable, shareable anchors. Keep them stable once published. */
export const CHAPTER_ANCHORS: Record<ChapterId, string> = {
  account: "create-your-account",
  company: "verify-your-company",
  post: "post-a-job",
  pool: "find-candidates",
  unlock: "unlock-candidates",
  review: "review-a-candidate",
  team: "bring-your-team",
}

export const CHAPTER_STEPS = {
  account: ["email", "mobile", "password", "dashboard"],
  company: ["details", "legal", "documents", "submit", "verification"],
  post: ["upload", "read", "check", "publish", "manage"],
  pool: ["pickJob", "mode", "list", "peek"],
  unlock: ["choose", "confirm", "unlocked", "findAgain"],
  review: ["summary", "communication", "recording", "answers"],
  team: ["addMembers", "access", "share", "links"],
} as const satisfies Record<ChapterId, readonly string[]>

export const FAQ_IDS = [
  "documents",
  "jd",
  "live",
  "modes",
  "beforeUnlock",
  "expiry",
  "refund",
  "sharing",
] as const

export const READY_ANCHOR = "what-to-keep-ready"
export const JD_ANCHOR = "what-a-jd-contains"
export const FAQ_ANCHOR = "questions"

export const READY_ITEMS = [
  "email",
  "mobile",
  "numbers",
  "documents",
  "logo",
  "jd",
] as const

export const ANCHORS = [
  READY_ANCHOR,
  ...CHAPTERS.map((id) => CHAPTER_ANCHORS[id]),
  FAQ_ANCHOR,
]
