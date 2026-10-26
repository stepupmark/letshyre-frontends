import js from "@eslint/js"
import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

/** @param {{ tsconfigRootDir?: string }} [options] */
export function base({ tsconfigRootDir } = {}) {
  return defineConfig(
    globalIgnores([
      "**/build/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.react-router/**",
      "**/.turbo/**",
      "**/playwright-report/**",
      "**/test-results/**",
    ]),
    js.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        globals: { ...globals.browser, ...globals.node },
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      rules: {
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/restrict-template-expressions": [
          "error",
          { allowNumber: true },
        ],
        "no-restricted-imports": [
          "error",
          {
            paths: [
              { name: "axios", message: "Use @workspace/api." },
              {
                name: "framer-motion",
                message: "Use CSS transitions, or `motion` where it pays off.",
              },
              { name: "radix-ui", message: "Use @workspace/ui components." },
              {
                name: "@base-ui/react",
                message: "Use @workspace/ui components.",
              },
            ],
            patterns: [
              {
                group: ["@radix-ui/*", "@base-ui/react/*"],
                message: "Use @workspace/ui components.",
              },
              {
                group: ["@workspace/*/src/*"],
                message: "Import through the package's exports.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["**/*.{ts,tsx}"],
      // the design lab, drawn illustrations and tests are long by nature
      ignores: [
        "**/*.test.{ts,tsx}",
        "**/e2e/**",
        "**/lab/**",
        "**/art/**",
        "**/components/ui/**",
      ],
      rules: { "max-lines": ["warn", { max: 300 }] },
    },
    {
      files: ["**/*.{js,mjs,cjs}"],
      extends: [tseslint.configs.disableTypeChecked],
    }
  )
}
