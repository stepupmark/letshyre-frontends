import { LOW_CREDITS } from "@/lib/credits"

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

type StepKey = "account" | "job"
type StepState = "done" | "todo"

export interface Step {
  key: StepKey
  state: StepState
}

export function setupSteps({ hasJobs }: { hasJobs: boolean }): Step[] {
  return [
    { key: "account", state: "done" },
    { key: "job", state: hasJobs ? "done" : "todo" },
  ]
}
