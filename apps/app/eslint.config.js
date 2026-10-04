import { reactRouterApp } from "@workspace/eslint-config/react-router-app"

export default [
  ...reactRouterApp({ tsconfigRootDir: import.meta.dirname }),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "framer-motion",
              message: "Use motion/react-m inside LazyMotion.",
            },
            {
              name: "motion/react",
              importNames: ["motion"],
              message: "Use m from motion/react-m; motion skips LazyMotion.",
            },
          ],
        },
      ],
    },
  },
  {
    // prototype copy, replaced by catalogs when screens are built for real
    files: ["app/lab/**"],
    rules: { "i18next/no-literal-string": "off" },
  },
  {
    // Playwright fixtures call their callback `use`, which isn't the React hook
    files: ["e2e/**"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
]
