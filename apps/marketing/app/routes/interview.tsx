import { InterviewPage } from "@/features/interview"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"

import type { Route } from "./+types/interview"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "interview")

export const meta = pageMeta("interview")

export default InterviewPage
