import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "@workspace/i18n/react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { useQuery } from "@tanstack/react-query"
import { Copy, Lock, TriangleAlert } from "lucide-react"
import { lazy, Suspense, useId, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { BackLink } from "@/components/back-link"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { QueryState } from "@/components/query-state"
import { TextField } from "@/components/text-field"
import { buttonLink } from "@/lib/button-link"
import { checkOnBlur } from "@/lib/forms"
import { useGo } from "@/lib/navigation"

import { useUpdateTemplate } from "../../mutations/use-update-template"
import { templatesQuery } from "../../queries/templates.queries"
import {
  makeTemplateFormSchema,
  type TemplateValues,
} from "../../schemas/template-form.schema"
import type { Template } from "../../schemas/template.schema"
import type { TemplateChanges } from "../../services/templates.service"
import { CopyDialog } from "../library/copy-dialog"
import { EditorSkeleton } from "./editor-skeleton"

const TemplateFields = lazy(() => import("../editor/template-fields"))

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
        error={{ title: t("library.errorTitle"), body: t("library.errorBody") }}
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

function EditorForm({
  template,
  taken,
}: {
  template: Template
  taken: string[]
}) {
  const { t } = useTranslation(["invitations", "common"])
  const formId = useId()
  const go = useGo()
  const owned = !template.is_system
  const [exact, setExact] = useState(true)
  const [convert, setConvert] = useState(false)
  const [copying, setCopying] = useState(false)
  const schema = useMemo(
    () =>
      makeTemplateFormSchema({
        name: t("errors.name"),
        subject: t("errors.subject"),
        body: t("errors.body"),
        inviteLink: t("errors.inviteLink"),
        unknown: t("errors.unknown"),
      }),
    [t]
  )
  const initial = {
    name: template.name,
    subject: template.subject_template,
    body: template.body_html_template,
  }
  const form = useForm<TemplateValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
    mode: "onSubmit",
  })
  const save = useUpdateTemplate({
    form,
    onSaved: (saved) => {
      form.reset({
        name: saved.name,
        subject: saved.subject_template,
        body: saved.body_html_template,
      })
    },
  })
  const bodyLocked = owned && !exact && !convert

  const submit = form.handleSubmit((values) => {
    const dirty = form.formState.dirtyFields
    const changes: TemplateChanges = {
      ...(dirty.name && { name: values.name }),
      ...(dirty.subject && { subject_template: values.subject }),
      ...(dirty.body && { body_html_template: values.body }),
    }
    if (Object.keys(changes).length > 0)
      save.mutate({ id: template.id, changes })
  })

  return (
    <>
      <PageHeader
        title={template.name}
        description={owned ? t("editor.lead") : t("editor.starterLead")}
        actions={
          owned ? (
            <Button type="submit" form={formId} disabled={save.isPending}>
              {save.isPending ? t("editor.saving") : t("editor.save")}
            </Button>
          ) : (
            <Button
              onClick={() => {
                setCopying(true)
              }}
            >
              <Copy />
              {t("editor.copyToEdit")}
            </Button>
          )
        }
      />

      {!owned && (
        <Alert>
          <Lock />
          <AlertTitle>{t("editor.readOnlyTitle")}</AlertTitle>
          <AlertDescription>{t("editor.readOnlyBody")}</AlertDescription>
        </Alert>
      )}
      {bodyLocked && (
        <Alert>
          <TriangleAlert />
          <AlertTitle>{t("editor.fidelityTitle")}</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            {t("editor.fidelityBody")}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setConvert(true)
              }}
            >
              {t("editor.fidelityConvert")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <form
        id={formId}
        noValidate
        className="flex max-w-3xl flex-col gap-6"
        onSubmit={(event) => {
          void submit(event)
        }}
      >
        {owned && (
          <TextField
            label={t("editor.name")}
            autoComplete="off"
            error={form.formState.errors.name?.message}
            {...checkOnBlur(form, "name")}
          />
        )}
        <Suspense fallback={<EditorSkeleton />}>
          <TemplateFields
            form={form}
            initial={initial}
            readOnly={!owned}
            bodyLocked={bodyLocked}
            onFidelity={setExact}
          />
        </Suspense>
      </form>

      {copying && (
        <CopyDialog
          source={template}
          taken={taken}
          onClose={() => {
            setCopying(false)
          }}
          onCopied={(copy) => {
            go(
              href("/employer/invitations/templates/:templateId", {
                templateId: copy.id,
              })
            )
          }}
        />
      )}
    </>
  )
}
