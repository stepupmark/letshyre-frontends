import { useTranslation } from "@workspace/i18n/react"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { useId } from "react"
import { useFormState, type UseFormReturn } from "react-hook-form"

import { isMergeField } from "../../lib/merge-fields"
import type { TemplateValues } from "../../schemas/template-form.schema"
import { BodyEditor } from "./body-editor"
import { SubjectEditor } from "./subject-editor"

export default function TemplateFields({
  form,
  initial,
  readOnly,
  bodyLocked,
  onFidelity,
}: {
  form: UseFormReturn<TemplateValues>
  initial: { subject: string; body: string }
  readOnly: boolean
  bodyLocked: boolean
  onFidelity: (exact: boolean) => void
}) {
  const { t } = useTranslation("invitations")
  const id = useId()
  const { errors, isSubmitted } = useFormState({
    control: form.control,
    name: ["subject", "body"],
  })
  const labelOf = (key: string) =>
    isMergeField(key) ? t(`fields.${key}`) : null
  const set = (name: "subject" | "body", value: string) => {
    form.setValue(name, value, {
      shouldDirty: true,
      shouldValidate: isSubmitted,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Field data-invalid={Boolean(errors.subject)}>
        <FieldLabel id={`${id}-subject`}>{t("editor.subject")}</FieldLabel>
        <SubjectEditor
          initial={initial.subject}
          editable={!readOnly}
          labelOf={labelOf}
          placeholder={t("editor.subjectPlaceholder")}
          labelledBy={`${id}-subject`}
          describedBy={errors.subject ? `${id}-subject-error` : undefined}
          invalid={Boolean(errors.subject)}
          onChange={(value) => {
            set("subject", value)
          }}
        />
        <FieldError id={`${id}-subject-error`}>
          {errors.subject?.message}
        </FieldError>
      </Field>

      <Field data-invalid={Boolean(errors.body)}>
        <FieldLabel id={`${id}-body`}>{t("editor.body")}</FieldLabel>
        <div
          className="overflow-hidden rounded-lg border border-input transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-[invalid=true]:border-destructive"
          data-invalid={Boolean(errors.body)}
        >
          <BodyEditor
            initial={initial.body}
            editable={!readOnly && !bodyLocked}
            labelOf={labelOf}
            placeholder={t("editor.bodyPlaceholder")}
            editLabel={t("editor.editButton")}
            labelledBy={`${id}-body`}
            describedBy={
              errors.body
                ? `${id}-body-error`
                : readOnly
                  ? undefined
                  : `${id}-body-hint`
            }
            invalid={Boolean(errors.body)}
            onChange={(value) => {
              set("body", value)
            }}
            onFidelity={onFidelity}
          />
        </div>
        {errors.body ? (
          <FieldError id={`${id}-body-error`}>{errors.body.message}</FieldError>
        ) : (
          !readOnly && (
            <FieldDescription id={`${id}-body-hint`}>
              {t("editor.bodyHint")}
            </FieldDescription>
          )
        )}
      </Field>
    </div>
  )
}
