import "i18next"

import type common from "../locales/en/common.json"
import type sharedScorecard from "../locales/en/sharedScorecard.json"
import type shell from "../locales/en/shell.json"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: false
    resources: {
      common: typeof common
      sharedScorecard: typeof sharedScorecard
      shell: typeof shell
    }
  }
}
