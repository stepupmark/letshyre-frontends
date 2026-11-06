import { useTranslation } from "@workspace/i18n/react"
import { useQuery } from "@tanstack/react-query"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { BackLink } from "@/components/back-link"
import { EmptyState } from "@/components/empty-state"
import { QueryState } from "@/components/query-state"
import { buttonLink } from "@/lib/button-link"

import { templatesQuery } from "../../queries/templates.queries"
import { EditorForm } from "./editor-form"
import { EditorSkeleton } from "./editor-skeleton"

const LIBRARY = href("/employer/invitations")

export function TemplateEditor({ templateId }: { templateId: string }) {
  const { t } = useTranslation("invitations")
  const templates = useQuery(templatesQuery())
  return (
    <div className="flex flex-col gap-6">
      <BackLink to={LIBRARY}>{t("title")}</BackLink>
      <QueryState
        query={templates}
        skeleton={<EditorSkeleton />}
        error={{
          title: t("library.errorTitle"),
          body: t("library.errorRetry"),
        }}
      >
        {(list) => {
          const template = list.find((item) => item.id === templateId)
          return template ? (
            <EditorForm
              key={template.id}
              template={template}
              taken={list.map((item) => item.name)}
            />
          ) : (
            <EmptyState
              title={t("editor.missingTitle")}
              description={t("editor.missingBody")}
              action={
                <AppLink to={LIBRARY} className={buttonLink()}>
                  {t("editor.backToLibrary")}
                </AppLink>
              }
            />
          )
        }}
      </QueryState>
    </div>
  )
}
