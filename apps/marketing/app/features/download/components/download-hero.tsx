import { useTranslation } from "@workspace/i18n/react"
import { CheckIcon } from "lucide-react"

import { Container } from "@/components/section"

import { AppWindow } from "./art/app-window"
import { DetectedDownload } from "./detected-download"

const FEATURES = ["distractionFree", "stable", "secure"] as const

export function DownloadHero() {
  const { t } = useTranslation("download")

  return (
    <header className="overflow-hidden border-b">
      <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)]">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-primary">
            {t("meta.crumb")}
          </p>
          <h1 className="max-w-xl text-4xl/[1.1] font-semibold tracking-tight text-balance sm:text-5xl/[1.05]">
            {t("title")}
          </h1>
          <p className="max-w-xl text-lg/7 text-pretty text-muted-foreground">
            {t("subtitle")}
          </p>
          <ul className="mt-1 flex flex-col gap-2.5 text-sm">
            {FEATURES.map((id) => (
              <li key={id} className="flex items-center gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-muted text-brand-text">
                  <CheckIcon aria-hidden className="size-3" strokeWidth={3} />
                </span>
                {t(`features.${id}`)}
              </li>
            ))}
          </ul>
          <DetectedDownload />
        </div>
        <div className="mx-auto w-full max-w-md max-sm:hidden lg:max-w-none">
          <AppWindow />
        </div>
      </Container>
    </header>
  )
}
