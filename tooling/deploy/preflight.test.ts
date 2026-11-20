// usage: pnpm test:deploy

import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { checkSettings } from "./preflight.ts"

const good = {
  AWS_REGION: "ap-south-1",
  BUCKET: "letshyre-prod-web-marketing",
  DISTRIBUTION_ID: "E1S25PYIAKH2UZ",
  CLOUDFRONT_DOMAIN: "d37v698yiv2fu8.cloudfront.net",
  SITE_HOST: "beta.letshyre.ai",
  CSP_MODE: "report-only",
}

describe("checkSettings", () => {
  it("accepts a complete set, with the optional ones left empty", () => {
    assert.deepEqual(checkSettings(good), [])
    assert.deepEqual(
      checkSettings({ ...good, CLOUDFRONT_DOMAIN: "", CSP_MODE: "" }),
      []
    )
  })

  it("names every missing setting at once", () => {
    assert.deepEqual(
      checkSettings({ ...good, BUCKET: "", DISTRIBUTION_ID: "" }),
      ["BUCKET is not set", "DISTRIBUTION_ID is not set"]
    )
  })

  it("catches values pasted into the wrong field or with extra bits", () => {
    const problems = checkSettings({
      ...good,
      DISTRIBUTION_ID: "d37v698yiv2fu8.cloudfront.net",
      SITE_HOST: "https://beta.letshyre.ai/",
      CLOUDFRONT_DOMAIN: "E1S25PYIAKH2UZ",
      CSP_MODE: "on",
    })
    assert.equal(problems.length, 4)
  })
})
