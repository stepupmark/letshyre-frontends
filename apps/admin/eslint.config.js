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
  { ignores: ["app/components/ui/**"] },
  {
    // radix until @workspace/ui
    files: ["app/**"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    // replaced by @workspace/blocks and the shared theme
    files: [
      "app/components/theme-provider.tsx",
      "app/components/trend.tsx",
      "app/components/layout/navigation-progress.tsx",
      "app/hooks/use-mobile.ts",
    ],
    rules: {
      "react-refresh/only-export-components": "off",
      "react-hooks/set-state-in-effect": "off",
      "better-tailwindcss/no-unknown-classes": "off",
      "better-tailwindcss/no-restricted-classes": "off",
    },
  },
  {
    // shell becomes a feature, company KYC moves to shared, tables move to react-table v9
    files: [
      "app/components/layout/**",
      "app/components/data-table/**",
      "app/features/employers/**",
    ],
    rules: {
      "boundaries/dependencies": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
]
