import { localePath } from "@workspace/i18n"
import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { DownloadIcon } from "lucide-react"
import { Link } from "react-router"

import { HIGHLIGHT } from "@/components/highlight"
import { Container, PageHeader } from "@/components/section"
import { useActiveSection } from "@/hooks/use-active-section"
import { APP_LINKS } from "@/lib/app-links"
import { PAGES } from "@/lib/pages"

import { GuidePath } from "./components/art/guide-path"
import { BeforeYouStart } from "./components/before-you-start"
import { InterviewCta } from "./components/interview-cta"
import { InterviewPrivacy } from "./components/interview-privacy"
import { InterviewSteps } from "./components/interview-steps"
import { InterviewToc } from "./components/interview-toc"
import { ANCHORS } from "./lib/sections"

export function InterviewPage() {
  const { t } = useTranslation("interview")
  const lang = useLocale()
  const active = useActiveSection(ANCHORS)

  return (
    <>
      <PageHeader
        eyebrow={t("meta.crumb")}
        title={<Trans t={t} i18nKey="title" components={HIGHLIGHT} />}
        description={t("intro")}
        art={<GuidePath />}
      >
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            to={localePath(lang, PAGES.download.path)}
            className={buttonVariants({ size: "lg", className: "h-10 px-4" })}
          >
            <DownloadIcon aria-hidden />
            {t("cta.button")}
          </Link>
          <a
            href={APP_LINKS.candidateRegister}
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "h-10 px-4",
            })}
          >
            {t("cta.secondary")}
          </a>
        </div>
      </PageHeader>
      <BeforeYouStart />
      <Container className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
        <InterviewToc active={active} />
        <div className="flex min-w-0 flex-col gap-14">
          <InterviewSteps active={active} />
          <InterviewPrivacy />
        </div>
      </Container>
      <InterviewCta />
    </>
  )
}
