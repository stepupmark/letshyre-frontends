import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon } from "lucide-react"

import { ClosingBand } from "@/components/closing-band"
import { CtaLink, OutlineLink } from "@/components/cta-links"
import { APP_LINKS } from "@/lib/app-links"
import { PAGES } from "@/lib/pages"

import { CandidatesFaq } from "./components/candidates-faq"
import { Fairness } from "./components/fairness"
import { FileStory } from "./components/file-story"
import { Hero } from "./components/hero"
import { Prepare } from "./components/prepare"
import { WhatEmployersSee } from "./components/what-employers-see"

export function CandidatesPage() {
  const { t } = useTranslation("candidates")
  const lang = useLocale()

  return (
    <>
      <Hero />
      <Fairness />
      <FileStory />
      <WhatEmployersSee />
      <Prepare />
      <CandidatesFaq />
      <ClosingBand
        title={t("final.title")}
        accent={t("final.accent")}
        description={t("final.description")}
        flushTop
      >
        <CtaLink href={APP_LINKS.candidateRegister}>
          {t("final.cta")}
          <ArrowRightIcon aria-hidden className="rtl:-scale-x-100" />
        </CtaLink>
        <OutlineLink to={localePath(lang, PAGES.download.path)}>
          {t("final.download")}
        </OutlineLink>
      </ClosingBand>
    </>
  )
}
