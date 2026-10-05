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
const PAGES: Record<Side, [string, Prompt[]][]> = {
  employer: [
    ["/employer/view-jobs/applicants", ["matchScore", "unlockCost"]],
    ["/employer/candidate-pool", ["matchScore", "unlockCost"]],
    ["/employer/view-jobs", ["betterJob", "pauseJob"]],
    ["/employer/post-job", ["betterJob", "matchScore"]],
    ["/employer/unlocked-candidates", ["readScorecard", "shareScorecard"]],
    ["/employer/employee-", ["readScorecard", "shareScorecard"]],
    ["/employer/billing", ["credits", "gstInvoice"]],
    ["/employer/invoice", ["gstInvoice", "credits"]],
    ["", ["firstJob", "readScorecard", "credits"]],
  ],
  candidate: [
    ["/employee/my-applications", ["afterApply", "shortlist"]],
    ["/employee/score-cards-list", ["ownScore", "retake"]],
    ["/employee/scorecard", ["ownScore", "retake"]],
    ["/employee/profile", ["standOut", "whoSees"]],
    ["/employee/interview-guide", ["needForInterview", "connectionDrops"]],
    ["", ["findFit", "howInterview", "afterApply"]],
  ],
}

export const promptsFor = (side: Side, pathname: string) =>
  PAGES[side].find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? []
