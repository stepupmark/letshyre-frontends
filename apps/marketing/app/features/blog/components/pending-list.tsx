import { useTranslation } from "@workspace/i18n/react"
import { lazy, type ReactNode, Suspense } from "react"
import { useNavigation } from "react-router"

import { isListPath } from "@/lib/blog/paths"

// only while navigating, so the skeletons load then
const PostSkeletons = lazy(() => import("./post-skeletons"))

export function PendingList({ children }: { children: ReactNode }) {
  const { t } = useTranslation("common")
  const navigation = useNavigation()
  const pending =
    navigation.state === "loading" && isListPath(navigation.location.pathname)

  if (!pending) return children

  return (
    <div role="status" aria-label={t("pageState.loading")}>
      <Suspense>
        <PostSkeletons />
      </Suspense>
    </div>
  )
}
