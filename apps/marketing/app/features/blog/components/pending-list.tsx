import { useTranslation } from "@workspace/i18n/react"
import { lazy, type ReactNode, Suspense } from "react"
import { useNavigation } from "react-router"

// only while navigating, so the skeletons load then
const PostSkeletons = lazy(() => import("./post-skeletons"))

// the blog index, its later pages and the topic pages; a post page has its own loading
const LIST_PATH = /^\/[\w-]+\/blogs(?:\/page\/\d+|\/topics\/[\w-]+)?\/?$/

export function PendingList({ children }: { children: ReactNode }) {
  const { t } = useTranslation("common")
  const navigation = useNavigation()
  const pending =
    navigation.state === "loading" &&
    LIST_PATH.test(navigation.location.pathname)

  if (!pending) return children

  return (
    <div role="status" aria-label={t("pageState.loading")}>
      <Suspense>
        <PostSkeletons />
      </Suspense>
    </div>
  )
}
