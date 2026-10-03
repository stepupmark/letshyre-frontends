import boundaries from "eslint-plugin-boundaries"
import { defineConfig } from "eslint/config"
import { react } from "./react.js"

const ROUTE_EXPORTS = [
  "meta",
  "links",
  "headers",
  "handle",
  "loader",
  "clientLoader",
  "action",
  "clientAction",
  "middleware",
  "clientMiddleware",
  "shouldRevalidate",
  "ErrorBoundary",
  "HydrateFallback",
  "Layout",
]

const SHARED = ["components", "hooks", "lib"]

const policies = [
  {
    from: { element: { type: "route" } },
    allow: [
      {
        to: {
          element: { type: "feature", fileInternalPath: "index.{ts,tsx}" },
        },
      },
      { to: { element: { types: { anyOf: ["layout", "shared"] } } } },
    ],
  },
  {
    from: { element: { type: "layout" } },
    allow: [
      {
        to: {
          element: { type: "feature", fileInternalPath: "index.{ts,tsx}" },
        },
      },
      { to: { element: { types: { anyOf: ["layout", "shared"] } } } },
    ],
  },
  {
    from: { element: { type: "feature" } },
    allow: [
      {
        to: {
          element: {
            type: "feature",
            captured: { feature: "{{ from.captured.feature }}" },
          },
        },
      },
      { to: { element: { type: "shared" } } },
    ],
  },
  {
    from: { element: { type: "shared" } },
    allow: { to: { element: { type: "shared" } } },
  },
]

/** @param {{ tsconfigRootDir?: string, tailwindEntryPoint?: string }} [options] */
export function reactRouterApp(options = {}) {
  return defineConfig(react(options), {
    files: ["app/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: { alwaysTryTypes: true, project: options.tsconfigRootDir },
      },
      "boundaries/root-path": options.tsconfigRootDir,
      "boundaries/include": ["app/**/*"],
      "boundaries/elements": [
        { type: "route", pattern: "app/routes" },
        { type: "layout", pattern: "app/layouts" },
        { type: "feature", pattern: "app/features/*", capture: ["feature"] },
        ...SHARED.map((dir) => ({ type: "shared", pattern: `app/${dir}` })),
      ],
    },
    rules: {
      "boundaries/dependencies": ["error", { default: "disallow", policies }],
      "react-refresh/only-export-components": [
        "error",
        { allowConstantExport: true, allowExportNames: ROUTE_EXPORTS },
      ],
    },
  })
}
