import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes"

// the design lab only exists in dev
const lab =
  process.env.NODE_ENV === "production"
    ? []
    : prefix("_lab", [
        layout("lab/lab-layout.tsx", [
          index("lab/lab-index.tsx"),
          route("dashboard", "lab/dashboard.tsx"),
          route("applicants", "lab/applicants.tsx"),
          route("scorecard", "lab/scorecard.tsx"),
          route("blocks", "lab/blocks.tsx"),
        ]),
      ])

// URLs from before the 2026-10 cleanup; lib/moved.ts maps each to its new home
const moved = [
  "employer",
  "employer/post-job",
  "employer/view-jobs",
  "employer/view-jobs/:jobId",
  "employer/view-jobs/applicants/:jobId",
  "employer/candidate-pool",
  "employer/unlocked-candidates",
  "employer/employee-profile",
  "employer/employee-score-card",
  "employer/invoice",
  "employer/your-team",
  "employer/profile",
  "employer/chatbot",
  "employee",
  "employee/find-jobs",
  "employee/my-applications",
  "employee/score-cards-list",
  "employee/scorecard",
  "employee/chatbot",
].map((path) => route(path, "routes/moved.tsx", { id: `moved:${path}` }))

export default [
  layout("layouts/auth-layout.tsx", [
    route("sign-in", "routes/auth/sign-in.tsx"),
    route("employer/sign-in", "routes/auth/role-sign-in.tsx", {
      id: "sign-in-employer",
    }),
    route("employee/sign-in", "routes/auth/role-sign-in.tsx", {
      id: "sign-in-candidate",
    }),
    index("routes/auth/get-started.tsx"),
    // marketing's "Log in" still links here
    route("get-started", "routes/auth/get-started.tsx", {
      id: "get-started-alias",
    }),
    route("employer/register", "routes/auth/register.tsx", {
      id: "register-employer",
    }),
    route("employee/register", "routes/auth/register.tsx", {
      id: "register-candidate",
    }),
    route("forgot-password", "routes/auth/forgot-password.tsx"),
  ]),
  layout("layouts/public-layout.tsx", [
    route("shared-scorecard/:shareId", "routes/shared-scorecard.tsx"),
  ]),
  layout("layouts/onboarding-layout.tsx", [
    route("employer/onboarding", "routes/employer/onboarding.tsx"),
  ]),
  layout("layouts/candidate-onboarding-layout.tsx", [
    route("employee/onboarding", "routes/employee/onboarding.tsx"),
  ]),
  layout("layouts/employer-layout.tsx", [
    ...prefix("employer", [
      route("dashboard", "routes/employer/dashboard.tsx"),
      route("jobs", "routes/employer/jobs.tsx"),
      route("jobs/new", "routes/employer/post-job.tsx"),
      route("jobs/:jobId", "routes/employer/job.tsx"),
      route("jobs/:jobId/edit", "routes/employer/job.tsx", {
        id: "job-edit",
      }),
      route("jobs/:jobId/applicants", "routes/employer/applicants.tsx"),
      route("candidates", "routes/employer/candidate-pool.tsx"),
      route("candidates/unlocked", "routes/employer/unlocked.tsx"),
      route("candidates/compare", "routes/employer/compare.tsx"),
      route("candidates/:candidateId", "routes/employer/candidate-profile.tsx"),
      route(
        "candidates/:candidateId/scorecard",
        "routes/employer/candidate-scorecard.tsx"
      ),
      route("billing", "routes/employer/billing.tsx"),
      route("invoices", "routes/employer/invoices.tsx"),
      route("team", "routes/employer/team.tsx"),
      route("shared-links", "routes/employer/shared-links.tsx"),
      route("company", "routes/employer/company.tsx"),
      route("company/edit", "routes/employer/company-edit.tsx"),
      route("assistant", "routes/employer/assistant.tsx"),
      route("*", "routes/not-found.tsx", { id: "employer-not-found" }),
    ]),
  ]),
  layout("layouts/employee-layout.tsx", [
    ...prefix("employee", [
      route("jobs", "routes/employee/find-jobs.tsx"),
      route("applications", "routes/employee/applications.tsx"),
      route("scorecards", "routes/employee/scorecards.tsx"),
      route("scorecards/:scorecardId", "routes/employee/scorecard.tsx"),
      route("profile", "routes/employee/profile.tsx"),
      route("interview-guide", "routes/employee/interview-guide.tsx"),
      route("assistant", "routes/employee/assistant.tsx"),
      route("*", "routes/not-found.tsx", { id: "employee-not-found" }),
    ]),
  ]),
  ...moved,
  ...lab,
] satisfies RouteConfig
