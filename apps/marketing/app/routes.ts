import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes"

export default [
  route("404", "routes/not-found.tsx"),
  layout("layouts/site-layout.tsx", [
    ...prefix(":lang", [
      index("routes/home.tsx"),
      route("pricing", "routes/pricing.tsx"),
      route("how-it-works-interview", "routes/interview.tsx"),
      route("download", "routes/download.tsx"),
      route("contact", "routes/contact.tsx"),
      route("about", "routes/about.tsx"),
      route("terms", "routes/terms.tsx"),
      route("policy", "routes/privacy.tsx"),
      route("refund-policy", "routes/refund.tsx"),
    ]),
  ]),
] satisfies RouteConfig
