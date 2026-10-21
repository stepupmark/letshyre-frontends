import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon } from "lucide-react"

import { ClosingBand } from "@/components/closing-band"
import { CtaLink, OutlineLink } from "@/components/cta-links"
import { APP_LINKS } from "@/lib/app-links"
import { PAGES } from "@/lib/pages"

import { CompareDemo } from "./components/compare-demo"
import { EmployersFaq } from "./components/employers-faq"
import { FileStory } from "./components/file-story"
import { Hero } from "./components/hero"
import { PricingLine } from "./components/pricing-line"
import { Problem } from "./components/problem"
import { UnlockContents } from "./components/unlock-contents"

export function EmployersPage() {
  const { t } = useTranslation("employers")
  const lang = useLocale()

  return (
    <>
      <Hero />
      <Problem />
      <FileStory />
      <UnlockContents />
      <CompareDemo />
      <PricingLine />
      <EmployersFaq />
      <ClosingBand
        title={t("final.title")}
        accent={t("final.accent")}
        description={t("final.description")}
      >
        <CtaLink href={APP_LINKS.employerRegister}>
          {t("final.cta")}
          <ArrowRightIcon aria-hidden className="rtl:-scale-x-100" />
        </CtaLink>
        <OutlineLink to={localePath(lang, PAGES.contact.path)}>
          {t("final.contact")}
        </OutlineLink>
      </ClosingBand>
    </>
  )
}
