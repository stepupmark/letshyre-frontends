import "i18next"

import type about from "../locales/en/about.json"
import type assistant from "../locales/en/assistant.json"
import type common from "../locales/en/common.json"
import type contact from "../locales/en/contact.json"
import type download from "../locales/en/download.json"
import type employerGuide from "../locales/en/employerGuide.json"
import type home from "../locales/en/home.json"
import type interview from "../locales/en/interview.json"
import type legalPolicy from "../locales/en/legalPolicy.json"
import type legalRefund from "../locales/en/legalRefund.json"
import type legalTerms from "../locales/en/legalTerms.json"
import type pricing from "../locales/en/pricing.json"
import type seo from "../locales/en/seo.json"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: false
    resources: {
      about: typeof about
      assistant: typeof assistant
      common: typeof common
      contact: typeof contact
      download: typeof download
      employerGuide: typeof employerGuide
      home: typeof home
      interview: typeof interview
      legalPolicy: typeof legalPolicy
      legalRefund: typeof legalRefund
      legalTerms: typeof legalTerms
      pricing: typeof pricing
      seo: typeof seo
    }
  }
}
