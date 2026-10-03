import { type RouteConfig, index, prefix } from "@react-router/dev/routes"

export default [
  ...prefix(":lang", [index("routes/home.tsx")]),
] satisfies RouteConfig
