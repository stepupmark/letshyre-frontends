import {
  type DesktopOs,
  type DesktopRelease,
  desktopDownloadUrl,
} from "@workspace/api/public"
import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { CheckIcon, DownloadIcon } from "lucide-react"
import type { Ref } from "react"

import { env } from "@/lib/env"

import { useDownloadState } from "../hooks/use-download-state"

export function DownloadLink({
  os,
  describedBy,
  ref,
  className,
}: {
  os: DesktopOs
  describedBy?: string
  ref?: Ref<HTMLAnchorElement>
  className?: string
}) {
  const { t } = useTranslation("download")
  const { started, start } = useDownloadState()
  const Icon = started ? CheckIcon : DownloadIcon

  return (
    <a
      ref={ref}
      href={desktopDownloadUrl(env.VITE_API_BASE_URL, os)}
      aria-describedby={describedBy}
      onClick={start}
      className={cn(
        buttonVariants({ size: "lg" }),
        "group/download h-10 px-4",
        className
      )}
    >
      <Icon
        key={started ? "done" : "idle"}
        aria-hidden
        className={cn(
          "transition-transform motion-reduce:transition-none",
          started ? "pop" : "group-hover/download:translate-y-0.5"
        )}
      />
      {t("downloadFor", { os: t(`os.${os}`) })}
    </a>
  )
}

/** Shown under a download link once it's clicked. */
export function NextStep() {
  const { t } = useTranslation("download")
  const { started } = useDownloadState()
  if (!started) return null

  return (
    <p className="rise text-sm text-muted-foreground">
      {t("next.body")}{" "}
      <a href="#install" className="text-link">
        {t("next.link")}
      </a>
    </p>
  )
}

/** Version and file type, which the download link points at for context. */
export function ReleaseMeta({
  id,
  release,
}: {
  id: string
  release: DesktopRelease
}) {
  const { t } = useTranslation("download")
  const type = release.filename?.split(".").at(-1)?.toUpperCase()

  return (
    <span id={id} className="text-sm text-muted-foreground tabular-nums">
      {[
        release.version && t("release.version", { version: release.version }),
        type && t("release.installer", { type }),
      ]
        .filter(Boolean)
        .join(" · ")}
    </span>
  )
}
