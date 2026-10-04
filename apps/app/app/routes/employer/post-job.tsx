import { useTranslation } from "@workspace/i18n/react"

import { PageHeader } from "@/components/page-header"
import { PostJob } from "@/features/employer-jobs"
import { namespaces } from "@/lib/i18n"

export const handle = { crumb: "postJob" } as const

export const clientMiddleware = [namespaces(["jobs"])]

export default function PostJobPage() {
  const { t } = useTranslation(["jobs", "common"])
  return (
    <div className="flex flex-col gap-8">
      <title>{`${t("post.title")} · ${t("common:appName")}`}</title>
      <PageHeader title={t("post.title")} description={t("post.lead")} />
      <PostJob />
    </div>
  )
}
