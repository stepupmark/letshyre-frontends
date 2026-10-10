const MOVED: Record<string, string> = {
  "/employer": "/employer/dashboard",
  "/employer/post-job": "/employer/jobs/new",
  "/employer/view-jobs": "/employer/jobs",
  "/employer/candidate-pool": "/employer/candidates",
  "/employer/unlocked-candidates": "/employer/candidates/unlocked",
  "/employer/invoice": "/employer/invoices",
  "/employer/your-team": "/employer/team",
  "/employer/profile": "/employer/company",
  "/employer/chatbot": "/employer/assistant",
  "/employee": "/employee/jobs",
  "/employee/find-jobs": "/employee/jobs",
  "/employee/my-applications": "/employee/applications",
  "/employee/score-cards-list": "/employee/scorecards",
  "/employee/chatbot": "/employee/assistant",
}

// old pages that took the record id as ?id=
const BY_ID: Record<string, [string, string]> = {
  "/employer/employee-profile": [
    "/employer/candidates/:id",
    "/employer/candidates/unlocked",
  ],
  "/employer/employee-score-card": [
    "/employer/candidates/:id/scorecard",
    "/employer/candidates/unlocked",
  ],
  "/employee/scorecard": ["/employee/scorecards/:id", "/employee/scorecards"],
}

const JOB = /^\/employer\/view-jobs\/(applicants\/)?([^/]+)$/

/** Where a pre-2026-10 app URL lives now, query string kept. */
export function movedTo(url: URL): string {
  const path = url.pathname.replace(/(.)\/$/, "$1")
  const query = new URLSearchParams(url.search)
  let to = MOVED[path]

  const job = JOB.exec(path)
  if (job) {
    const [, applicants, id] = job
    if (applicants) to = `/employer/jobs/${id}/applicants`
    else {
      to = `/employer/jobs/${id}${query.get("edit") === "1" ? "/edit" : ""}`
      query.delete("edit")
    }
  }

  const byId = BY_ID[path]
  if (byId) {
    const id = query.get("id")
    query.delete("id")
    to = id ? byId[0].replace(":id", encodeURIComponent(id)) : byId[1]
  }

  const search = query.toString()
  return `${to ?? "/sign-in"}${search ? `?${search}` : ""}`
}
