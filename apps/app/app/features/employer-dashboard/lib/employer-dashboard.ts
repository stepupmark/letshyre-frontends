import { LOW_CREDITS } from "@/lib/credits"

export type Review = "pending" | "verified" | "rejected"

export type Attention = "creditsOut" | "creditsLow" | "noOpenJobs" | "noJobs"

export function attentionOf({
  credits,
  openJobs,
  closedJobs,
}: {
  credits: number | undefined
  openJobs: number
  closedJobs: number
}): Attention[] {
  const items: Attention[] = []
  if (credits !== undefined && credits <= LOW_CREDITS)
    items.push(credits === 0 ? "creditsOut" : "creditsLow")
  if (openJobs === 0) items.push(closedJobs > 0 ? "noOpenJobs" : "noJobs")
  return items
}

type StepKey = "account" | "company" | "job" | "team"
type StepState = "done" | "waiting" | "todo" | "fix"

export interface Step {
  key: StepKey
  state: StepState
}

export function setupSteps({
  hasJobs,
  hasTeam,
  review,
}: {
  hasJobs: boolean
  hasTeam: boolean
  review: Review | undefined
}): Step[] {
  return [
    { key: "account", state: "done" },
    {
      key: "company",
      state:
        review === "verified"
          ? "done"
          : review === "rejected"
            ? "fix"
            : "waiting",
    },
    { key: "job", state: hasJobs ? "done" : "todo" },
    { key: "team", state: hasTeam ? "done" : "todo" },
  ]
}
