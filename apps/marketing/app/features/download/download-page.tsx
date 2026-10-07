import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { CheckIcon } from "lucide-react"
import { useId } from "react"
import { Link } from "react-router"

import { Container, PageHeader } from "@/components/section"
import { PAGES } from "@/lib/pages"

import { DetectedDownload } from "./components/detected-download"
import { DownloadFaq } from "./components/download-faq"
import { InstallSteps } from "./components/install-steps"
import { ReleaseList } from "./components/release-list"

const FEATURES = ["distractionFree", "stable", "secure"] as const

export function DownloadPage() {
  const { t } = useTranslation("download")
  const { t: tc } = useTranslation("common")
  const lang = useLocale()
  const supportId = useId()

  return (
    <>
      <PageHeader
        eyebrow={t("meta.crumb")}
        title={t("title")}
        description={t("subtitle")}
      >
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6">
          {FEATURES.map((id) => (
            <li key={id} className="flex items-center gap-2">
              <CheckIcon aria-hidden className="size-4 text-brand" />
              {t(`features.${id}`)}
            </li>
          ))}
        </ul>
        <DetectedDownload />
      </PageHeader>
      <Container className="flex flex-col gap-12 py-10 sm:gap-16 sm:py-14">
        <ReleaseList />
        <InstallSteps />
        <DownloadFaq />
        <section
          aria-labelledby={supportId}
          className="flex flex-col gap-4 rounded-xl border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div className="flex flex-col gap-1">
            <h2 id={supportId} className="text-base font-semibold">
              {tc("support.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {tc("support.body")}
            </p>
          </div>
          <Link
            to={localePath(lang, PAGES.contact.path)}
            className={buttonVariants({ variant: "outline" })}
          >
            {tc("support.contact")}
          </Link>
        </section>
      </Container>
    </>
  )
}
