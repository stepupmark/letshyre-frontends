import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { Container, PageHeader } from "@/components/section"

import { InstallSteps } from "./components/install-steps"
import { ReleaseList } from "./components/release-list"

const FEATURES = ["distractionFree", "stable", "secure"] as const

export function DownloadPage() {
  const { t } = useTranslation("download")
  const lang = useLocale()

  return (
    <>
      <PageHeader
        eyebrow={t("meta.crumb")}
        title={t("title")}
        description={t("subtitle")}
      >
        <ul className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6">
          {FEATURES.map((id) => (
            <li key={id} className="flex items-center gap-2">
              <span
                aria-hidden
                className="rounded-full bg-primary block-1.5 inline-1.5"
              />
              {t(`features.${id}`)}
            </li>
          ))}
        </ul>
      </PageHeader>
      <Container className="flex flex-col gap-16 py-16 sm:gap-24 sm:py-24">
        <ReleaseList />
        <InstallSteps />
        <p className="text-sm text-muted-foreground">
          <Link
            to={localePath(lang, "/how-it-works-interview")}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {t("support")}
          </Link>
        </p>
      </Container>
    </>
  )
}
