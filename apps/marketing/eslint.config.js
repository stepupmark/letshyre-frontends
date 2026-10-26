import { fileURLToPath } from "node:url"
import { reactRouterApp } from "@workspace/eslint-config/react-router-app"

export default [
  ...reactRouterApp({
    tsconfigRootDir: import.meta.dirname,
    tailwindEntryPoint: fileURLToPath(
      new URL("app/styles/app.css", import.meta.url)
    ),
  }),
  {
    files: ["**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]
