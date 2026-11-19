import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { affects } from "./affected.ts"

describe("affects", () => {
  it("deploys an app when its own files change, and only that app", () => {
    const paths = ["apps/marketing/content/blog/new-post/en.mdx"]
    assert.ok(affects("marketing", paths))
    assert.ok(!affects("app", paths))
    assert.ok(!affects("admin", paths))
  })

  it("deploys every app when shared code, the lockfile or the deploy changes", () => {
    for (const path of [
      "packages/ui/src/components/button.tsx",
      "pnpm-lock.yaml",
      "tooling/csp.ts",
      "tooling/deploy/files.ts",
      ".github/workflows/deploy.yml",
    ]) {
      assert.ok(affects("app", [path]), path)
      assert.ok(affects("admin", [path]), path)
    }
  })

  it("leaves the sites alone for docs, edge functions and CI-only changes", () => {
    const paths = [
      "docs/deployment.md",
      "infra/cloudfront/headers.js",
      ".github/workflows/ci.yml",
      "tooling/i18n/apply.ts",
    ]
    assert.ok(!affects("marketing", paths))
    assert.ok(!affects("app", paths))
  })

  it("doesn't mistake one app's folder for another's prefix", () => {
    assert.ok(!affects("app", ["apps/apple/x.ts"]))
    assert.ok(!affects("admin", ["apps/administration/x.ts"]))
  })
})
