import { DownloadPage } from "@/features/download"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/download"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "download")

export const meta = pageMeta("download")

export default DownloadPage
