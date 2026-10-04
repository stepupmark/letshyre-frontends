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
  layout("layouts/public-layout.tsx", [
    route("shared-scorecard/:shareId", "routes/shared-scorecard.tsx"),
  ]),
  layout("layouts/employer-layout.tsx", [
    ...prefix("employer", [
      index("routes/employer/dashboard.tsx", { id: "employer-home" }),
      route("dashboard", "routes/employer/dashboard.tsx"),
      route("release-check", "routes/employer/release-check.tsx"),
    ]),
  ]),
  layout("layouts/employee-layout.tsx", [
    ...prefix("employee", [index("routes/employee/find-jobs.tsx")]),
  ]),
  ...lab,
] satisfies RouteConfig
