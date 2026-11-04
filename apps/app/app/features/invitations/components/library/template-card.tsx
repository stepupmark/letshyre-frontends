import { useLocale, useTranslation } from "@workspace/i18n/react"
import { PenLine, Send } from "lucide-react"
import type { ReactNode } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { StatusBadge } from "@/components/status-badge"
import { buttonLink } from "@/lib/button-link"

import type { Template } from "../../schemas/template.schema"
import { TokenText } from "../shared/field-token"
import { TemplateThumbnail } from "./template-thumbnail"

const editorPath = (templateId: string) =>
  href("/employer/invitations/templates/:templateId", { templateId })

export function TemplateCard({
  template,
  menu,
  secondary,
}: {
  template: Template
  menu?: ReactNode
  /** replaces Edit, e.g. Make a copy on a LetsHyre template */
  secondary?: ReactNode
}) {
  const { t } = useTranslation("invitations")
  const locale = useLocale()
  const inactive = template.is_active === false
  const edited = template.updated_at
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        new Date(template.updated_at)
      )
    : null

  return (
    <article className="group flex h-full flex-col rounded-lg border bg-card transition-colors hover:border-foreground/20">
      <AppLink to={editorPath(template.id)} tabIndex={-1} aria-hidden="true">
        <TemplateThumbnail template={template} />
      </AppLink>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start gap-2">
          <h3 className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
            <AppLink
              to={editorPath(template.id)}
              className="truncate rounded-sm font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {template.name}
            </AppLink>
            {inactive && (
              <StatusBadge tone="neutral">{t("library.inactive")}</StatusBadge>
            )}
          </h3>
          {menu}
        </div>
        <p className="line-clamp-2 text-sm text-pretty text-muted-foreground">
          <span className="sr-only">{t("library.subject")} </span>
          <TokenText text={template.subject_template} />
        </p>
        <p className="mt-auto pt-1 text-xs text-muted-foreground">
          {template.is_system
            ? t("library.byLetshyre")
            : edited && t("library.editedOn", { date: edited })}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        {secondary ?? (
          <AppLink
            to={editorPath(template.id)}
            className={buttonLink({ variant: "outline" })}
          >
            <PenLine />
            {t("library.edit")}
          </AppLink>
        )}
        <AppLink
          to={`${href("/employer/invitations/send")}?template=${template.id}&step=candidates`}
          className={buttonLink()}
        >
          <Send className="rtl:-scale-x-100" />
          {t("library.sendOne")}
        </AppLink>
      </div>
    </article>
  )
}
