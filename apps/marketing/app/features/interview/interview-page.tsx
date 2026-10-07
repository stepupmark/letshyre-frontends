import { Trans, useTranslation } from "@workspace/i18n/react"

import { HIGHLIGHT } from "@/components/highlight"
import { Container, PageHeader } from "@/components/section"

import { BeforeYouStart } from "./components/before-you-start"
import { InterviewCta } from "./components/interview-cta"
import { InterviewPrivacy } from "./components/interview-privacy"
import { InterviewSteps } from "./components/interview-steps"
import { InterviewToc } from "./components/interview-toc"

export function InterviewPage() {
  const { t } = useTranslation("interview")

  return (
    <>
      <PageHeader
        eyebrow={t("meta.crumb")}
        title={<Trans t={t} i18nKey="title" components={HIGHLIGHT} />}
        description={t("intro")}
      />
      <BeforeYouStart />
      <Container className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
        <InterviewToc />
        <div className="flex min-w-0 flex-col gap-12">
          <InterviewSteps />
          <InterviewPrivacy />
        </div>
      </Container>
      <InterviewCta />
    </>
  )
}
