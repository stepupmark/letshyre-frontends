// Checks a deploy job's settings before anything is uploaded, so a typo fails in seconds.
// usage: node tooling/deploy/preflight.ts
//   env: AWS_REGION, BUCKET, DISTRIBUTION_ID, CLOUDFRONT_DOMAIN (optional), SITE_HOST, CSP_MODE

import { lookup } from "node:dns/promises"

type Settings = Readonly<Record<string, string | undefined>>

const RULES: readonly [name: string, pattern: RegExp, example: string][] = [
  ["AWS_REGION", /^[a-z]{2}(-[a-z]+)+-\d$/, "ap-south-1"],
  ["BUCKET", /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/, "letshyre-prod-web-app"],
  ["DISTRIBUTION_ID", /^E[A-Z0-9]{8,}$/, "E1S25PYIAKH2UZ"],
  ["SITE_HOST", /^[a-z0-9-]+(\.[a-z0-9-]+)+$/, "app.letshyre.ai"],
]

/** Every problem with the settings, or none. */
export function checkSettings(env: Settings): string[] {
  const problems: string[] = []
  for (const [name, pattern, example] of RULES) {
    const value = env[name]
    if (!value) problems.push(`${name} is not set`)
    else if (!pattern.test(value))
      problems.push(`${name} "${value}" doesn't look like ${example}`)
  }
  const domain = env.CLOUDFRONT_DOMAIN
  if (domain && !/^d[a-z0-9]+\.cloudfront\.net$/.test(domain))
    problems.push(
      `CLOUDFRONT_DOMAIN "${domain}" doesn't look like d1234abcd.cloudfront.net`
    )
  const csp = env.CSP_MODE
  if (csp && csp !== "report-only" && csp !== "enforce")
    problems.push(`CSP_MODE "${csp}" must be report-only or enforce`)
  return problems
}

if (import.meta.main) {
  const problems = checkSettings(process.env)
  if (problems.length) {
    console.error(problems.map((p) => `✖ ${p}`).join("\n"))
    process.exit(1)
  }
  // a site can be uploaded before its DNS record exists; only the smoke test needs it
  const host = process.env.SITE_HOST ?? ""
  await lookup(host).then(
    () => {
      console.log(`preflight: settings look right, ${host} resolves`)
    },
    () => {
      console.log(
        `::warning::${host} doesn't resolve yet, so the smoke test will fail until its DNS record exists`
      )
    }
  )
}
