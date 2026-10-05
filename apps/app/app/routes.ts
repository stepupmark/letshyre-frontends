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

export default [
  layout("layouts/auth-layout.tsx", [
    route("sign-in", "routes/auth/sign-in.tsx"),
    route("get-started", "routes/auth/get-started.tsx"),
    route("employer/register", "routes/auth/register.tsx", {
      id: "register-employer",
    }),
    route("employee/register", "routes/auth/register.tsx", {
      id: "register-candidate",
    }),
    route("forgot-password", "routes/auth/forgot-password.tsx"),
  ]),
  route("employer/sign-in", "routes/auth/old-sign-in.tsx", {
    id: "old-sign-in-employer",
  }),
  route("employee/sign-in", "routes/auth/old-sign-in.tsx", {
    id: "old-sign-in-candidate",
  }),
  layout("layouts/public-layout.tsx", [
    route("shared-scorecard/:shareId", "routes/shared-scorecard.tsx"),
    route("employer/release-check", "routes/employer/release-check.tsx"),
  ]),
  layout("layouts/onboarding-layout.tsx", [
    route("employer/onboarding", "routes/employer/onboarding.tsx"),
  ]),
  layout("layouts/candidate-onboarding-layout.tsx", [
    route("employee/onboarding", "routes/employee/onboarding.tsx"),
  ]),
  layout("layouts/employer-layout.tsx", [
    ...prefix("employer", [
      index("routes/employer/dashboard.tsx", { id: "employer-home" }),
      route("dashboard", "routes/employer/dashboard.tsx"),
      route("post-job", "routes/employer/post-job.tsx"),
      route("view-jobs", "routes/employer/jobs.tsx"),
      route("view-jobs/:jobId", "routes/employer/job.tsx"),
      route("view-jobs/applicants/:jobId", "routes/employer/applicants.tsx"),
      route("candidate-pool", "routes/employer/candidate-pool.tsx"),
      route("unlocked-candidates", "routes/employer/unlocked.tsx"),
      route("employee-profile", "routes/employer/candidate-profile.tsx"),
      route("employee-score-card", "routes/employer/candidate-scorecard.tsx"),
      route("billing", "routes/employer/billing.tsx"),
      route("invoice", "routes/employer/invoices.tsx"),
      route("your-team", "routes/employer/team.tsx"),
      route("shared-links", "routes/employer/shared-links.tsx"),
      route("profile", "routes/employer/company.tsx"),
      route("chatbot", "routes/employer/assistant.tsx"),
    ]),
  ]),
  layout("layouts/employee-layout.tsx", [
    ...prefix("employee", [
      index("routes/employee/find-jobs.tsx", { id: "candidate-home" }),
      route("find-jobs", "routes/employee/find-jobs.tsx"),
      route("my-applications", "routes/employee/applications.tsx"),
      route("score-cards-list", "routes/employee/scorecards.tsx"),
      route("scorecard", "routes/employee/scorecard.tsx"),
      route("profile", "routes/employee/profile.tsx"),
      route("interview-guide", "routes/employee/interview-guide.tsx"),
      route("chatbot", "routes/employee/assistant.tsx"),
    ]),
  ]),
  ...lab,
] satisfies RouteConfig
