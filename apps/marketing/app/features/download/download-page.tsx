import { useTranslation } from "@workspace/i18n/react"
import { useMemo, useState } from "react"

import { Container } from "@/components/section"

import { DownloadFaq } from "./components/download-faq"
import { DownloadHero } from "./components/download-hero"
import { InstallSteps } from "./components/install-steps"
import { ReleaseList } from "./components/release-list"
import { SupportBand } from "./components/support-band"
import { DownloadState } from "./hooks/use-download-state"

export function DownloadPage() {
  const { t } = useTranslation("download")
  const [started, setStarted] = useState(false)
  const state = useMemo(
    () => ({
      started,
      start: () => {
        setStarted(true)
      },
    }),
    [started]
  )

  return (
    <DownloadState value={state}>
      <DownloadHero />
      <Container className="flex flex-col gap-16 py-12 sm:gap-24 sm:py-20">
        <ReleaseList />
        <InstallSteps />
        <DownloadFaq />
        <SupportBand />
      </Container>
      <p role="status" className="sr-only">
        {started ? t("next.body") : ""}
      </p>
    </DownloadState>
  )
}
