import { useTranslation } from "@workspace/i18n/react"
import { FieldGroup } from "@workspace/ui/components/field"
import {
  FileBadge,
  FileCheck,
  FileSignature,
  FileText,
  type LucideIcon,
} from "lucide-react"
import { Controller, useWatch, type UseFormReturn } from "react-hook-form"

import { FileDropzone } from "@/components/file-dropzone"

import { draftFiles } from "../../hooks/use-onboarding-draft"
import {
  DOCUMENT,
  DOCUMENTS,
  PROOF_TYPES,
  REQUIRED_DOCUMENTS,
  type DocumentField,
  type Values,
} from "../../schemas/onboarding-form.schema"
import { ChoiceField } from "./choice-field"

const ICONS: Record<DocumentField, LucideIcon> = {
  resignation_letter: FileSignature,
  experience_letter: FileBadge,
  notice_period_proof: FileCheck,
  present_offer: FileText,
}

export function DocumentsStep({ form }: { form: UseFormReturn<Values> }) {
  const { t } = useTranslation("candidateOnboarding")
  const { errors } = form.formState
  const files = useWatch({ control: form.control, name: REQUIRED_DOCUMENTS })
  const added = files.filter((file) => file instanceof File).length

  return (
    <FieldGroup>
      <p className="text-sm text-muted-foreground">{t("work.documentsLead")}</p>
      <ChoiceField
        form={form}
        name="notice_period_proof_type"
        label={t("work.proofType")}
        items={PROOF_TYPES.map((p) => ({
          value: p,
          label: t(`work.proofTypes.${p}`),
        }))}
      />

      <section
        aria-labelledby="documents"
        className="overflow-hidden rounded-xl border"
      >
        <div className="flex items-center justify-between gap-4 border-b bg-muted/30 px-4 py-3">
          <h3 id="documents" className="text-sm font-medium">
            {t("work.documents")}
          </h3>
          <p className="shrink-0 text-xs font-medium tabular-nums">
            {t("work.count", { added, total: REQUIRED_DOCUMENTS.length })}
          </p>
        </div>
        <div className="divide-y">
          {DOCUMENTS.map((name) => (
            <Controller
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FileDropzone
                  label={
                    name === "present_offer"
                      ? t("work.optional", { label: t(`work.docs.${name}`) })
                      : t(`work.docs.${name}`)
                  }
                  description={t(`work.docHints.${name}`)}
                  rules={DOCUMENT}
                  layout="row"
                  icon={ICONS[name]}
                  value={field.value ?? null}
                  error={errors[name]?.message}
                  onSelect={(file) => {
                    field.onChange(file ?? undefined)
                    void draftFiles.save(name, file)
                    if (file) form.clearErrors(name)
                  }}
                />
              )}
            />
          ))}
        </div>
      </section>
    </FieldGroup>
  )
}
