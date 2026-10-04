import "i18next"

import type auth from "../locales/en/auth.json"
import type common from "../locales/en/common.json"
import type dashboard from "../locales/en/dashboard.json"
import type jobs from "../locales/en/jobs.json"
import type matches from "../locales/en/matches.json"
import type onboarding from "../locales/en/onboarding.json"
import type sharedScorecard from "../locales/en/sharedScorecard.json"
import type shell from "../locales/en/shell.json"
import type unlock from "../locales/en/unlock.json"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: false
    resources: {
      auth: typeof auth
      common: typeof common
      dashboard: typeof dashboard
      jobs: typeof jobs
      matches: typeof matches
      onboarding: typeof onboarding
      sharedScorecard: typeof sharedScorecard
      shell: typeof shell
      unlock: typeof unlock
    }
  }
}
