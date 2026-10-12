import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { useQuery } from "@tanstack/react-query"
import { CheckIcon, LinkIcon } from "lucide-react"
import { useId } from "react"

import { useCopy } from "@/hooks/use-copy"

import { useDetectedOs } from "../hooks/use-detected-os"
import { releaseQuery } from "../queries/releases.queries"
import { DownloadLink, NextStep, ReleaseMeta } from "./download-link"

/** The visitor's own download, up front. The slot keeps its height so nothing jumps. */
export function DetectedDownload() {
  const detected = useDetectedOs()
  const os = detected === "other" ? null : detected
  const versionId = useId()
  const { data: release } = useQuery({
    ...releaseQuery(os ?? "windows"),
    enabled: os !== null,
  })

  return (
    <div className="mt-4 flex min-h-10 flex-col gap-3">
      {detected === "other" && <ElsewhereNote />}
      {os && release?.available && (
        <>
          <div className="rise flex flex-wrap items-center gap-x-4 gap-y-2">
            <DownloadLink os={os} describedBy={versionId} />
            <ReleaseMeta id={versionId} release={release} />
          </div>
          <NextStep />
        </>
      )}
    </div>
  )
}

/** Phones, tablets and Linux: no build here, so help them get the page onto a computer. */
function ElsewhereNote() {
  const { t } = useTranslation("download")
  const { canCopy, copied, copy } = useCopy()

  return (
    <div className="rise flex flex-col items-start gap-3">
      <p className="max-w-xl text-sm text-pretty text-muted-foreground">
        {t("release.unsupported")}
      </p>
      {canCopy && (
        <Button
          variant="outline"
          size="lg"
          className="h-10 px-4"
          onClick={() => {
            copy(window.location.href)
          }}
        >
          {copied ? (
            <CheckIcon aria-hidden className="pop" />
          ) : (
            <LinkIcon aria-hidden />
          )}
          {copied ? t("copied") : t("copyLink")}
        </Button>
      )}
      <span role="status" className="sr-only">
        {copied ? t("copied") : ""}
      </span>
    </div>
  )
}
