import { DownloadPage, downloadJsonLd } from "@/features/download"
import { pageData } from "@/lib/page-data.server"
import { readingFontPreload } from "@/lib/reading-font"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/_site.$lang.download"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "download")

export const links: Route.LinksFunction = () => [readingFontPreload]

export const meta = pageMeta("download", downloadJsonLd)

export default DownloadPage
