import "i18next"

import type auth from "../locales/en/auth.json"
import type billing from "../locales/en/billing.json"
import type candidate from "../locales/en/candidate.json"
import type candidateOnboarding from "../locales/en/candidateOnboarding.json"
import type common from "../locales/en/common.json"
import type company from "../locales/en/company.json"
import type dashboard from "../locales/en/dashboard.json"
import type jobs from "../locales/en/jobs.json"
import type matches from "../locales/en/matches.json"
import type onboarding from "../locales/en/onboarding.json"
import type scorecard from "../locales/en/scorecard.json"
import type shell from "../locales/en/shell.json"
import type team from "../locales/en/team.json"
import type unlock from "../locales/en/unlock.json"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: false
    resources: {
      auth: typeof auth
      billing: typeof billing
      candidate: typeof candidate
      candidateOnboarding: typeof candidateOnboarding
      common: typeof common
      company: typeof company
      dashboard: typeof dashboard
      jobs: typeof jobs
      matches: typeof matches
      onboarding: typeof onboarding
      scorecard: typeof scorecard
      shell: typeof shell
      team: typeof team
      unlock: typeof unlock
    }
  }
}
