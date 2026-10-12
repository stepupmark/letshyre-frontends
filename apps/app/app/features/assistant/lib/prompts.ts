import { matchPath } from "react-router"

import type { RoutePattern } from "@/lib/app-paths"

export type Side = "employer" | "candidate"

type Prompt =
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
