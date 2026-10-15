import { matchPath } from "react-router"

import type { RoutePattern } from "@/lib/app-paths"

export type Side = "employer" | "candidate"

export type Prompt =
  | "firstJob"
  | "readScorecard"
  | "credits"
  | "betterJob"
  | "pauseJob"
  | "matchScore"
  | "unlockCost"
  | "shareScorecard"
  | "gstInvoice"
  | "findFit"
  | "howInterview"
  | "afterApply"
  | "shortlist"
  | "ownScore"
  | "retake"
  | "standOut"
  | "whoSees"
  | "needForInterview"
  | "connectionDrops"

// first match wins, so the more specific paths come first
const PAGES: Record<Side, [RoutePattern, Prompt[]][]> = {
  employer: [
    ["/employer/jobs/new", ["betterJob", "matchScore"]],
    ["/employer/jobs/:jobId/applicants", ["matchScore", "unlockCost"]],
    ["/employer/jobs", ["betterJob", "pauseJob"]],
    ["/employer/candidates/unlocked", ["readScorecard", "shareScorecard"]],
    ["/employer/candidates/:candidateId", ["readScorecard", "shareScorecard"]],
    ["/employer/candidates", ["matchScore", "unlockCost"]],
    ["/employer/billing", ["credits", "gstInvoice"]],
    ["/employer/invoices", ["gstInvoice", "credits"]],
  ],
  candidate: [
    ["/employee/applications", ["afterApply", "shortlist"]],
    ["/employee/scorecards", ["ownScore", "retake"]],
    ["/employee/profile", ["standOut", "whoSees"]],
    ["/employee/interview-guide", ["needForInterview", "connectionDrops"]],
  ],
}

const FALLBACK: Record<Side, Prompt[]> = {
  employer: ["firstJob", "readScorecard", "credits"],
  candidate: ["findFit", "howInterview", "afterApply"],
}

export const promptsFor = (side: Side, pathname: string) =>
  PAGES[side].find(([path]) =>
    matchPath({ path, end: false }, pathname)
  )?.[1] ?? FALLBACK[side]

export type Topic =
  "jobs" | "candidates" | "billing" | "applying" | "interview" | "profile"

export const TOPICS: Record<Side, [Topic, Prompt[]][]> = {
  employer: [
    ["jobs", ["firstJob", "betterJob", "pauseJob"]],
    [
      "candidates",
      ["matchScore", "readScorecard", "unlockCost", "shareScorecard"],
    ],
    ["billing", ["credits", "gstInvoice"]],
  ],
  candidate: [
    ["applying", ["findFit", "afterApply", "shortlist"]],
    [
      "interview",
      ["howInterview", "needForInterview", "connectionDrops", "retake"],
    ],
    ["profile", ["standOut", "whoSees", "ownScore"]],
  ],
}

/** Unasked questions from the topic of the last one, then from the rest. */
export function nextPrompts(
  side: Side,
  last: Prompt | undefined,
  asked: Set<Prompt>
) {
  const topics = TOPICS[side]
  const home = topics.find(([, prompts]) => last && prompts.includes(last))
  const order = home ? [home, ...topics.filter((t) => t !== home)] : topics
  return order
    .flatMap(([, prompts]) => prompts)
    .filter((prompt) => !asked.has(prompt))
    .slice(0, 2)
}
