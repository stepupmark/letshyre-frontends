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
        ]),
      ])

export default [
  route("employer/dashboard", "routes/employer/dashboard.tsx"),
  ...lab,
] satisfies RouteConfig
