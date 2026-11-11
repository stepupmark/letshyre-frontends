import { localePath } from "@workspace/i18n"
import { useLocale } from "@workspace/i18n/react"
import { ArrowLeftIcon } from "lucide-react"
import { Link } from "react-router"

export function BackLink({ to, label }: { to: string; label: string }) {
  const lang = useLocale()
  return (
    <Link
      to={localePath(lang, to)}
      className="text-link inline-flex items-center gap-2 self-start text-sm font-medium"
    >
      <ArrowLeftIcon aria-hidden className="size-4 rtl:-scale-x-100" />
      {label}
    </Link>
  )
}
