import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { BookmarkCheckIcon, BookmarkIcon } from "lucide-react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

import { PAGES } from "@/lib/pages"

import { savedPosts } from "../lib/reader"

export function SaveButton({ slug }: { slug: string }) {
  const { t } = useTranslation("blog")
  const lang = useLocale()
  const navigate = useNavigate()
  const store = savedPosts(lang)
  const saved = store.useValue()
  if (saved === undefined) return null
  const on = saved.includes(slug)

  return (
    <Button
      variant="outline"
      onClick={() => {
        const now = store.toggle(slug)
        toast.success(t(now ? "post.savedToast" : "post.unsavedToast"), {
          action: now
            ? {
                label: t("post.viewSaved"),
                onClick: () => {
                  void navigate(`${localePath(lang, PAGES.blog.path)}?saved=1`)
                },
              }
            : undefined,
        })
      }}
    >
      {on ? <BookmarkCheckIcon aria-hidden /> : <BookmarkIcon aria-hidden />}
      {on ? t("post.saved") : t("post.save")}
    </Button>
  )
}
