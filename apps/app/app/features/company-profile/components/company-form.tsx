import { HttpError, safeUrl } from "@workspace/api"
import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Spinner } from "@workspace/ui/components/spinner"
import { Textarea } from "@workspace/ui/components/textarea"
import { useQuery } from "@tanstack/react-query"
import { useId, useRef, useState } from "react"
import { Controller, useWatch } from "react-hook-form"
import { href, useNavigate } from "react-router"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { TextField } from "@/components/text-field"
import { checkOnBlur } from "@/lib/forms"
import { industriesQuery } from "@/lib/industries"
import { useLeaveGuard } from "@/hooks/use-leave-guard"

import { useCompanyForm } from "../hooks/use-company-form"
import { useSaveCompany } from "../mutations/use-save-company"
import {
  DESCRIPTION_MAX,
  FORM_FIELDS,
  type CompanyFormValues,
} from "../schemas/company-form.schema"
import type { Company } from "../schemas/company-profile.schema"
import { LogoPicker } from "./logo-picker"
import { Panel } from "./parts"

export function CompanyForm({
  company,
  focus,
}: {
  company: Company
  focus: string | null
}) {
  const { t } = useTranslation(["company", "common"])
  const navigate = useNavigate()
  const industries = useQuery(industriesQuery())
  const save = useSaveCompany()
  const kyc = company.kyc ?? {}
  const industryId = useId()
  const descriptionId = useId()
  const logoInput = useRef<HTMLInputElement>(null)
  const [logo, setLogo] = useState<File | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  const form = useCompanyForm(kyc, focus)
  const errors = form.formState.errors
  const description = useWatch({
    control: form.control,
    name: "company_description",
  })
  const dirty = form.formState.isDirty || logo !== null
  const guard = useLeaveGuard(dirty && !save.isSuccess)
  const items = industries.data ?? []
  const profile = href("/employer/company")
  const count = description.length

  const onSubmit = (values: CompanyFormValues) => {
    if (logoError) {
      logoInput.current?.focus()
      return
    }
    setFailed(false)
    save.mutate(
      { values, logo },
      {
        onSuccess: () => {
          guard.release()
          toast.success(t("saved"))
          void navigate(profile)
        },
        onError: (error) => {
          const fields =
            error instanceof HttpError ? error.fieldErrors : undefined
          let placed = false
          for (const name of FORM_FIELDS) {
            const message = fields?.[name]
            if (!message) continue
            form.setError(name, { message }, { shouldFocus: !placed })
            placed = true
          }
          if (fields?.company_logo) {
            setLogoError(fields.company_logo)
            placed = true
          }
          if (!placed) setFailed(true)
        },
      }
    )
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        void form.handleSubmit(onSubmit)(event)
      }}
    >
      <Panel title={t("logo.label")}>
        <LogoPicker
          current={safeUrl(kyc.company_logo)}
          file={logo}
          error={logoError}
          inputRef={logoInput}
          onPick={(file, problem) => {
            setLogo(problem ? null : file)
            setLogoError(problem)
          }}
        />
      </Panel>

      <Panel title={t("contact.title")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label={t("details.email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            error={errors.official_email?.message}
            {...checkOnBlur(form, "official_email")}
          />
          <TextField
            label={t("details.linkedin")}
            type="url"
            inputMode="url"
            placeholder={t("details.linkedinPlaceholder")}
            error={errors.linkedin_url?.message}
            {...checkOnBlur(form, "linkedin_url")}
          />
        </div>
        <TextField
          label={t("details.address")}
          autoComplete="street-address"
          error={errors.company_address?.message}
          {...checkOnBlur(form, "company_address")}
        />
      </Panel>

      <Panel title={t("about.title")}>
        <Controller
          control={form.control}
          name="company_industry"
          render={({ field }) => (
            <Field data-invalid={Boolean(errors.company_industry)}>
              <FieldLabel htmlFor={industryId}>
                {t("details.industry")}
              </FieldLabel>
              <Select
                items={items}
                value={field.value || null}
                onValueChange={(value) => {
                  field.onChange(value ?? "")
                }}
              >
                <SelectTrigger
                  id={industryId}
                  ref={field.ref}
                  className="w-full sm:w-80"
                  aria-invalid={Boolean(errors.company_industry)}
                >
                  <SelectValue placeholder={t("details.chooseIndustry")} />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {industries.isError && (
                <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {t("industriesFailed")}
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    className="h-auto p-0"
                    disabled={industries.isRefetching}
                    onClick={() => void industries.refetch()}
                  >
                    {t("common:state.retry")}
                  </Button>
                </p>
              )}
              <FieldError>{errors.company_industry?.message}</FieldError>
            </Field>
          )}
        />
        <Field data-invalid={Boolean(errors.company_description)}>
          <FieldLabel htmlFor={descriptionId}>
            {t("details.description")}
          </FieldLabel>
          <Textarea
            id={descriptionId}
            rows={5}
            aria-invalid={Boolean(errors.company_description)}
            aria-describedby={`${descriptionId}-count`}
            {...form.register("company_description")}
          />
          <div className="flex items-start justify-between gap-3">
            <FieldDescription>{t("details.descriptionHint")}</FieldDescription>
            <span
              id={`${descriptionId}-count`}
              data-near={count > DESCRIPTION_MAX * 0.9}
              data-over={count > DESCRIPTION_MAX}
              className="shrink-0 text-xs text-muted-foreground tabular-nums transition-colors data-[near=true]:text-warning data-[over=true]:text-destructive"
            >
              {t("details.counter", { count, max: DESCRIPTION_MAX })}
            </span>
          </div>
          <FieldError>{errors.company_description?.message}</FieldError>
        </Field>
      </Panel>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-xl border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <p
          role="status"
          data-dirty={dirty}
          className="me-auto text-sm text-muted-foreground data-[dirty=true]:font-medium data-[dirty=true]:text-foreground"
        >
          {failed ? (
            <span className="text-destructive">{t("saveFailed")}</span>
          ) : dirty ? (
            t("unsaved")
          ) : (
            t("noChanges")
          )}
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={save.isPending}
          onClick={() => void navigate(profile)}
        >
          {t("common:confirm.cancel")}
        </Button>
        <Button type="submit" disabled={!dirty || save.isPending}>
          {save.isPending && <Spinner />}
          {save.isPending ? t("saving") : t("save")}
        </Button>
      </div>

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
          guard.blocker.proceed?.()
        }}
      />
    </form>
  )
}
