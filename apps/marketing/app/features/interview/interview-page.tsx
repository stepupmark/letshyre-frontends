import { useTranslation } from "@workspace/i18n/react"

import { Container, PageHeader } from "@/components/section"

import { InterviewCta } from "./components/interview-cta"
import { InterviewSteps } from "./components/interview-steps"
import { InterviewToc } from "./components/interview-toc"
import { SystemRequirements } from "./components/system-requirements"

export function InterviewPage() {
  const { t } = useTranslation("interview")

  return (
    <>
      <PageHeader
        eyebrow={t("meta.crumb")}
        title={t("title")}
        description={t("intro")}
      />
      <Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
        <InterviewToc />
        <div className="flex min-w-0 flex-col gap-16">
          <InterviewSteps />
          <SystemRequirements />
          <InterviewCta />
        </div>
      </Container>
    </>
  )
}
