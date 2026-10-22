import type { Job } from "../schemas/candidate-jobs.schema"
import { companyOf } from "./candidate-jobs"
import { matches } from "./match"

export const STAGES = [
  "Applied",
  "Shortlisted",
  "Selected",
  "Rejected",
] as const
export type Stage = (typeof STAGES)[number]

export const APPLICATIONS_PAGE = 10

export interface ApplicationsView {
  stage: Stage
  page: number
  q: string
}

export function readView(params: URLSearchParams): ApplicationsView {
  const raw = params.get("status")?.toLowerCase()
  const page = Number.parseInt(params.get("page") ?? "", 10)
  return {
    stage: STAGES.find((stage) => stage.toLowerCase() === raw) ?? "Applied",
    page: Number.isInteger(page) && page > 0 ? page : 1,
    q: params.get("q")?.trim() ?? "",
  }
}

export function writeView(view: ApplicationsView, params: URLSearchParams) {
  const next = new URLSearchParams(params)
  if (view.stage === "Applied") next.delete("status")
  else next.set("status", view.stage.toLowerCase())
  if (view.page > 1) next.set("page", String(view.page))
  else next.delete("page")
  if (view.q) next.set("q", view.q)
  else next.delete("q")
  return next
}

export type StepState = "done" | "now" | "todo" | "stopped"

const PIPELINE = ["Applied", "Shortlisted", "Selected"] as const

/** Where a stage sits on Applied → Shortlisted → Selected; a rejection stops after Applied. */
export function stepsOf(stage: Stage): { stage: Stage; state: StepState }[] {
  if (stage === "Rejected")
    return [
      { stage: "Applied", state: "done" },
      { stage: "Rejected", state: "stopped" },
    ]
  const at = PIPELINE.indexOf(stage)
  return PIPELINE.map((item, i) => ({
    stage: item,
    state: i < at ? "done" : i === at ? "now" : "todo",
  }))
}

export const matchesApplication = (job: Job, q: string) =>
  !q || matches([job.title, companyOf(job)].filter(Boolean).join(" "), q)

export const appliedOn = (job: Job, locale: string) => {
  const date = job.applied_at ? new Date(job.applied_at) : null
  return date && Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)
    : null
}
