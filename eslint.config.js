import { base } from "@workspace/eslint-config/base"

// the root lints only the repo's own scripts; each app and package has its own config
export default [
  {
    ignores: [
      "apps/**",
      "packages/**",
      "infra/cloudfront/*.js",
      // a one-off capture script, kept for the record and still typechecked
      "tooling/baseline/**",
    ],
  },
  ...base({ tsconfigRootDir: import.meta.dirname }),
  {
    rules: {
      // an unset GitHub variable arrives as "", so `||` defaults are intended
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        { ignorePrimitives: { string: true } },
      ],
    },
  },
  {
    // node:test's describe and it return promises the runner awaits itself
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
    },
  },
]
