import { localePath } from "@workspace/i18n"

import { DownloadPage } from "@/features/download"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"
import { softwareApplicationSchema, webPageSchema } from "@/lib/seo/schema"
import { absUrl } from "@/lib/seo/site"

import type { Route } from "./+types/download"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "download")

export const meta = pageMeta("download", ({ lang, t, path }) => [
  webPageSchema({
    lang,
    path,
    name: t("meta.name"),
    description: t("meta.schemaDescription"),
  }),
  softwareApplicationSchema({
    name: t("meta.name"),
    description: t("meta.schemaDescription"),
    os: "Windows",
    url: absUrl(localePath(lang, path)),
  }),
])

export default DownloadPage
