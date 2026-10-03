import { desktopDownloadUrl, type DesktopOs } from "@workspace/api/public"
import { useTranslation } from "@workspace/i18n/react"
import { Badge } from "@workspace/ui/components/badge"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import { useId } from "react"

import { env } from "@/lib/env"

import { releaseQuery } from "../queries/releases.queries"

export function ReleaseCard({
  os,
  recommended = false,
}: {
  os: DesktopOs
  recommended?: boolean
}) {
  const { t } = useTranslation("download")
  const titleId = useId()
  const {
    data: release,
    status,
    refetch,
    isFetching,
  } = useQuery(releaseQuery(os))
  const name = t(`os.${os}`)
  const ready = status === "success" && release?.available ? release : null

  function statusText() {
    if (status === "pending") return t("loading")
    if (status === "error") return t("release.error")
    if (!ready) return t("release.notYet")
    return ready.version
      ? t("release.version", { version: ready.version })
      : null
  }

  return (
    <Card
      aria-labelledby={titleId}
      role="region"
      data-os={os}
      className="gap-6 py-6"
    >
      <CardHeader className="px-6">
        <h2 id={titleId} className="text-lg font-semibold">
          {name}
        </h2>
        <CardDescription aria-live="polite">{statusText()}</CardDescription>
        {recommended && (
          <CardAction>
            <Badge variant="secondary">{t("release.detected")}</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="px-6">
        {status === "pending" && <Skeleton className="h-9 w-full" />}
        {status === "error" && (
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            disabled={isFetching}
            onClick={() => {
              void refetch()
            }}
          >
            {t("retry")}
          </Button>
        )}
        {status === "success" &&
          (ready ? (
            <a
              href={desktopDownloadUrl(env.VITE_API_BASE_URL, os)}
              download={ready.filename ?? true}
              className={buttonVariants({ size: "lg", className: "w-full" })}
            >
              {t("downloadFor", { os: name })}
            </a>
          ) : (
            <Badge variant="outline">{t("comingSoon")}</Badge>
          ))}
      </CardContent>
    </Card>
  )
}
