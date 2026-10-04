import "i18next"

import type common from "../locales/en/common.json"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: false
    resources: {
      common: typeof common
    }
  }
}
