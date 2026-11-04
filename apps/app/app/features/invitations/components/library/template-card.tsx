import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Mail } from "lucide-react"
import type { ReactNode } from "react"

import { StatusBadge } from "@/components/status-badge"
import { relativeTime } from "@/lib/relative-time"

import { excerptOf } from "../../lib/plain-text"
import type { Template } from "../../schemas/template.schema"
import { TokenText } from "../shared/field-token"

export function TemplateCard({
  template,
  menu,
  children,
}: {
  template: Template
  menu?: ReactNode
  children: ReactNode
}) {
  const { t } = useTranslation("invitations")
  const locale = useLocale()
  return (
    <article className="group flex h-full flex-col rounded-lg border bg-card transition-colors hover:border-foreground/20">
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          >
            <Mail className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h3 className="truncate font-medium">{template.name}</h3>
            <p className="text-xs text-muted-foreground">
              {template.is_system
                ? t("library.byLetshyre")
                : template.updated_at
                  ? t("library.edited", {
                      when: relativeTime(template.updated_at, locale),
                    })
                  : t("library.yours")}
            </p>
          </div>
          {template.is_system && (
            <StatusBadge tone="neutral">{t("library.starter")}</StatusBadge>
          )}
          {menu}
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-pretty">
            <span className="sr-only">{t("library.subject")} </span>
            <TokenText text={template.subject_template} />
          </p>
          <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">
            <TokenText text={excerptOf(template.body_html_template)} />
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t px-5 py-3">
        {children}
      </div>
    </article>
  )
}
