import { desktopDownloadUrl } from "@workspace/api/public"
import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { useQuery } from "@tanstack/react-query"
import { DownloadIcon } from "lucide-react"

import { env } from "@/lib/env"

import { useDetectedOs } from "../hooks/use-detected-os"
import { releaseQuery } from "../queries/releases.queries"

/** The visitor's own download, up front. The slot keeps its height so nothing jumps. */
export function DetectedDownload() {
  const { t } = useTranslation("download")
  const detected = useDetectedOs()
  const os = detected === "other" ? null : detected
  const { data: release } = useQuery({
    ...releaseQuery(os ?? "windows"),
    enabled: os !== null,
  })

  return (
    <div className="mt-2 flex min-h-11 flex-wrap items-center gap-x-4 gap-y-2">
      {detected === "other" && (
        <p className="text-sm text-pretty text-muted-foreground">
          {t("release.unsupported")}
        </p>
      )}
      {os && release?.available && (
        <>
          <a
            href={desktopDownloadUrl(env.VITE_API_BASE_URL, os)}
            className={buttonVariants({ size: "lg" })}
          >
            <DownloadIcon aria-hidden />
            {t("downloadFor", { os: t(`os.${os}`) })}
          </a>
          {release.version && (
            <span className="text-sm text-muted-foreground">
              {t("release.version", { version: release.version })}
            </span>
          )}
        </>
      )}
    </div>
  )
}
