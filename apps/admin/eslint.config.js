import { reactRouterApp } from "@workspace/eslint-config/react-router-app"

export default [
  ...reactRouterApp({ tsconfigRootDir: import.meta.dirname }),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // internal tool, English only
      "i18next/no-literal-string": "off",
      // the API sends "" for missing text, so `||` fallbacks are intended
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        { ignorePrimitives: { string: true } },
      ],
    },
  },
  {
    files: ["app/features/auth/**"],
    rules: { "jsx-a11y/no-autofocus": "off" },
  },

  // TODO(admin): the overrides below go as the migration replaces this code
  {
    // tables move to react-table v9
    files: ["app/components/data-table/**"],
    rules: {
      "boundaries/dependencies": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
]
