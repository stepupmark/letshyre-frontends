// Saves real staging responses as e2e fixtures, with personal data replaced.
// usage: STAGING_API=... STAGING_TOKEN=... node scripts/capture-fixtures.ts

import { writeFileSync } from "node:fs"

const ENDPOINTS = ["/payment/v1/employer_credits/"]

const api = process.env.STAGING_API
const token = process.env.STAGING_TOKEN
if (!api || !token) {
  console.error("Set STAGING_API and STAGING_TOKEN (a staging test account)")
  process.exit(1)
}

const PERSONAL =
  /(name|email|phone|mobile|address|photo|logo|url|resume|token)/i

function scrub(value: unknown, key = ""): unknown {
  if (Array.isArray(value)) return value.map((item) => scrub(item, key))
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, scrub(v, k)])
    )
  if (typeof value === "string" && PERSONAL.test(key)) return `<${key}>`
  return value
}

for (const path of ENDPOINTS) {
  const response = await fetch(new URL(path, api), {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  })
  if (!response.ok) {
    console.error(`${path}: ${response.status}`)
    continue
  }
  const file = new URL(
    `../e2e/api/${path.slice(1, -1).replaceAll("/", ".")}.json`,
    import.meta.url
  )
  writeFileSync(
    file,
    `${JSON.stringify(scrub(await response.json()), null, 2)}\n`
  )
  console.log(`saved ${path}`)
}
