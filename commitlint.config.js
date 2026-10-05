export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      1,
      "always",
      [
        "repo",
        "deps",
        "baseline",
        "ui",
        "blocks",
        "i18n",
        "api",
        "analytics",
        "eslint-config",
        "typescript-config",
        "marketing",
        "app",
        "infra",
        "docs",
      ],
    ],
  },
}
