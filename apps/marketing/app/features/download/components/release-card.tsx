import type { DesktopOs } from "@workspace/api/public"
import { useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useId, useRef } from "react"

import { releaseQuery } from "../queries/releases.queries"
import { Device } from "./art/device"
import { DownloadLink, NextStep, ReleaseMeta } from "./download-link"

export function ReleaseCard({
  os,
  recommended = false,
}: {
  os: DesktopOs
  recommended?: boolean
}) {
  const { t } = useTranslation("download")
  const titleId = useId()
  const statusId = useId()
  const {
    data: release,
    status,
    refetch,
    isFetching,
  } = useQuery(releaseQuery(os))
  const name = t(`os.${os}`)
  const ready = status === "success" && release?.available ? release : null

  // the retry button goes away while it loads, so hand focus to whatever replaces it
  const retried = useRef(false)
  const action = useRef<HTMLElement | null>(null)
  const card = useRef<HTMLDivElement>(null)
  const setAction = (el: HTMLElement | null) => {
    action.current = el
  }
  useEffect(() => {
    if (!retried.current || isFetching) return
    retried.current = false
    ;(action.current ?? card.current)?.focus()
  }, [isFetching])

  return (
    <Card
      ref={card}
      tabIndex={-1}
      role="group"
      aria-labelledby={titleId}
      data-os={os}
      data-recommended={recommended || undefined}
      className="group/release flex-col gap-5 p-5 transition-[box-shadow,translate] duration-300 outline-none hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5 data-recommended:ring-2 data-recommended:ring-brand motion-reduce:transition-none sm:flex-row sm:items-center sm:gap-6 sm:p-6"
    >
      <Device os={os} ready={ready !== null} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id={titleId} className="text-lg/7 font-semibold tracking-tight">
            {name}
          </h3>
          {recommended && (
            <Badge className="rise">{t("release.detected")}</Badge>
          )}
        </div>
        {ready ? (
          <ReleaseMeta id={statusId} release={ready} />
        ) : (
          <p id={statusId} className="text-sm text-muted-foreground">
            {status === "pending" && t("loading")}
            {status === "error" && t("release.error")}
            {status === "success" && t("release.notYet")}
          </p>
        )}
        {ready && <NextStep />}
      </div>
      <div className="flex shrink-0 sm:w-56 sm:justify-end">
        {status === "pending" && <Skeleton className="h-10 w-full" />}
        {status === "error" && (
          <Button
            ref={setAction}
            variant="outline"
            size="lg"
            className="h-10 w-full px-4"
            aria-describedby={statusId}
            disabled={isFetching}
            onClick={() => {
              retried.current = true
              void refetch()
            }}
          >
            {t("retry")} <span className="sr-only">{name}</span>
          </Button>
        )}
        {status === "success" &&
          (ready ? (
            <DownloadLink
              ref={setAction}
              os={os}
              describedBy={statusId}
              className="w-full"
            />
          ) : (
            <Badge variant="outline" className="h-7 px-3">
              {t("comingSoon")}
            </Badge>
          ))}
      </div>
    </Card>
  )
}
