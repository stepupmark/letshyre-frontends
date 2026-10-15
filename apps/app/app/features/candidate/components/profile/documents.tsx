import { useTranslation } from "@workspace/i18n/react"
import { ArrowUpRight, FileText } from "lucide-react"

export interface Doc {
  key: string
  label: string
  href: string
}

export function DocumentList({
  docs,
  single = false,
}: {
  docs: Doc[]
  /** one per row, for narrow side panels */
  single?: boolean
}) {
  const { t } = useTranslation("candidate")
  return (
    <ul className={single ? "grid gap-2" : "grid gap-2 sm:grid-cols-2"}>
      {docs.map((doc) => (
        <li key={doc.key}>
          <a
            href={doc.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="group/doc flex items-center gap-3 rounded-lg border p-3 text-sm font-medium transition-[border-color,translate] duration-200 outline-none hover:-translate-y-0.5 hover:border-brand focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-muted text-brand-text [&_svg]:size-4"
            >
              <FileText />
            </span>
            <span className="min-w-0 flex-1 truncate">{doc.label}</span>
            <span className="sr-only">{t("profile.newTab")}</span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-transform group-hover/doc:translate-x-0.5 group-hover/doc:-translate-y-0.5 motion-reduce:transition-none rtl:-scale-x-100 rtl:group-hover/doc:-translate-x-0.5"
            />
          </a>
        </li>
      ))}
    </ul>
  )
}
