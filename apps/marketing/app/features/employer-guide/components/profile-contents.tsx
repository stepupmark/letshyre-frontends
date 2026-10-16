import { useTranslation } from "@workspace/i18n/react"
import { CheckIcon } from "lucide-react"

export function ProfileContents() {
  const { t } = useTranslation("employerGuide")
  const items = t("chapters.review.profile", {
    returnObjects: true,
  })

  return (
    <div className="mt-10 flex flex-col gap-4 rounded-2xl border p-5 sm:p-6">
      <h3 className="text-lg font-semibold tracking-tight text-brand-text">
        {t("chapters.review.profileTitle")}
      </h3>
      <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm">
            <CheckIcon
              aria-hidden
              className="pop-in mt-0.5 size-4 shrink-0 text-brand-text"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
