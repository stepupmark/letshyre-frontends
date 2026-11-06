import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Copy, Eye } from "lucide-react"
import { lazy, Suspense, useId, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { href } from "react-router"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { TextField } from "@/components/text-field"
import { useAutosave } from "@/hooks/use-draft"
import { useLeaveGuard } from "@/hooks/use-leave-guard"
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft"
import { checkOnBlur } from "@/lib/forms"
import { useGo } from "@/lib/navigation"

import { issuesOf } from "../../lib/readiness"
import { useUpdateTemplate } from "../../mutations/use-update-template"
import {
  makeTemplateFormSchema,
  type TemplateValues,
} from "../../schemas/template-form.schema"
import type { Template } from "../../schemas/template.schema"
import type { TemplateChanges } from "../../services/templates.service"
import { CopyDialog } from "../library/copy-dialog"
import { PreviewSheet } from "../preview/preview-sheet"
import { EditorSkeleton } from "./editor-skeleton"
import { DraftNotice, FidelityNotice } from "./editor-notices"
import { ReadinessIssues } from "./readiness"
import { SaveState } from "./save-state"

const TemplateFields = lazy(() => import("../editor/template-fields"))

interface Draft {
  name: string
  subject: string
  body: string
  base: string | null
}

const draftKey = (id: string) => `invitation-template:${id}`

export function EditorForm({
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
  const base = template.updated_at ?? null
  const saved = {
    name: template.name,
    subject: template.subject_template,
    body: template.body_html_template,
  }
  const [initial, setInitial] = useState(saved)
  const [mount, setMount] = useState(0)
  const [draft, setDraft] = useState(() => {
    if (!owned) return null
    const stored = loadDraft<Draft>(draftKey(template.id))
    return stored?.base === base && stored.body !== undefined ? stored : null
  })
  const [exact, setExact] = useState(true)
  const [convert, setConvert] = useState(false)
  const [copying, setCopying] = useState(false)
  const [previewing, setPreviewing] = useState(false)
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
  const form = useForm<TemplateValues>({
    resolver: zodResolver(schema),
    defaultValues: saved,
    mode: "onSubmit",
  })
  const [subject, body] = useWatch({
    control: form.control,
    name: ["subject", "body"],
  })
  const values = useWatch({ control: form.control })
  const dirty = form.formState.isDirty
  const save = useUpdateTemplate({
    form,
    onSaved: (next) => {
      clearDraft(draftKey(template.id))
      form.reset({
        name: next.name,
        subject: next.subject_template,
        body: next.body_html_template,
      })
    },
  })
  const guard = useLeaveGuard(dirty && !save.isPending)
  const bodyLocked = owned && !exact && !convert
  const issues = owned ? issuesOf(subject, body) : []

  useAutosave(values, () => {
    if (!owned || draft) return
    if (dirty) saveDraft(draftKey(template.id), { ...values, base })
    else clearDraft(draftKey(template.id))
  })

  const restore = (from: Partial<Draft>) => {
    const next = {
      name: from.name ?? saved.name,
      subject: from.subject ?? saved.subject,
      body: from.body ?? saved.body,
    }
    for (const name of ["name", "subject", "body"] as const)
      if (next[name] !== saved[name])
        form.setValue(name, next[name], { shouldDirty: true })
    setInitial(next)
    setMount((n) => n + 1)
    setDraft(null)
  }

  const submit = form.handleSubmit((values) => {
    const changed = form.formState.dirtyFields
    const changes: TemplateChanges = {
      ...(changed.name && { name: values.name }),
      ...(changed.subject && { subject_template: values.subject }),
      ...(changed.body && { body_html_template: values.body }),
    }
    if (Object.keys(changes).length > 0)
      save.mutate({ id: template.id, changes })
  })

  const previewButton = (
    <Button
      variant="outline"
      onClick={() => {
        setPreviewing(true)
      }}
    >
      <Eye />
      {t("editor.preview")}
    </Button>
  )

  return (
    <>
      <PageHeader
        title={
          owned ? (
            template.name
          ) : (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {template.name}
              <StatusBadge tone="neutral">{t("library.starter")}</StatusBadge>
            </span>
          )
        }
        actions={
          owned ? (
            <div className="flex items-center gap-3">
              <SaveState dirty={dirty} saved={save.isSuccess} />
              {previewButton}
              <Button
                type="submit"
                form={formId}
                disabled={save.isPending || !dirty}
              >
                {save.isPending ? t("editor.saving") : t("editor.save")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {previewButton}
              <Button
                onClick={() => {
                  setCopying(true)
                }}
              >
                <Copy />
                {t("editor.copyToEdit")}
              </Button>
            </div>
          )
        }
      />

      {draft && (
        <DraftNotice
          onRestore={() => {
            restore(draft)
          }}
          onDiscard={() => {
            clearDraft(draftKey(template.id))
            setDraft(null)
          }}
        />
      )}
      {bodyLocked && (
        <FidelityNotice
          onConvert={() => {
            setConvert(true)
          }}
        />
      )}

      <form
        id={formId}
        noValidate
        className="flex max-w-3xl min-w-0 flex-col gap-6"
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
        <ReadinessIssues issues={issues} />
        <Suspense fallback={<EditorSkeleton />}>
          <TemplateFields
            key={mount}
            form={form}
            initial={initial}
            readOnly={!owned}
            bodyLocked={bodyLocked}
            onFidelity={setExact}
          />
        </Suspense>
      </form>

      <PreviewSheet
        open={previewing}
        onClose={() => {
          setPreviewing(false)
        }}
        templateId={template.id}
        subject={subject}
        body={body}
      />
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
      <ConfirmDialog
        open={guard.blocker.state === "blocked"}
        onOpenChange={(open) => {
          if (!open) guard.blocker.reset?.()
        }}
        title={t("leave.title")}
        description={t("leave.body")}
        confirmLabel={t("leave.confirm")}
        destructive
        onConfirm={() => {
          clearDraft(draftKey(template.id))
          guard.blocker.proceed?.()
        }}
      />
    </>
  )
}
