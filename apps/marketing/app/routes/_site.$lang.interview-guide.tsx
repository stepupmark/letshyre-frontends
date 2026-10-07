import { InterviewPage } from "@/features/interview"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"
import { webPageSchema } from "@/lib/seo/schema"
import { SITE } from "@/lib/seo/site"

import type { Route } from "./+types/_site.$lang.interview-guide"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "interview")

export const meta = pageMeta("interview", ({ lang, t, path }) => [
  {
    ...webPageSchema({
      lang,
      path,
      name: t("meta.name"),
      description: t("meta.schemaDescription"),
    }),
    about: { "@id": `${SITE.url}/#organization` },
    audience: { "@type": "Audience", audienceType: t("meta.audience") },
  },
])

export default InterviewPage
