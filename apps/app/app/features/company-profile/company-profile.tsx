import { zodResolver } from "@hookform/resolvers/zod"
import { HttpError } from "@workspace/api"
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
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Textarea } from "@workspace/ui/components/textarea"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Building2,
  ExternalLink,
  FileText,
  ImageUp,
  Pencil,
} from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useCallback, useId, useMemo, useState, type ReactNode } from "react"
import { Controller, useForm, type FieldPath } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { LoadError } from "@/components/query-state"
import { StatusBadge, type Tone } from "@/components/status-badge"
import { TextField } from "@/components/text-field"
import { useDelayed } from "@/hooks/use-delayed"
import { checkFile, type FileRules } from "@/lib/file-rules"
import { checkOnBlur } from "@/lib/forms"
import { industriesQuery } from "@/lib/industries"
import { duration, ease } from "@/lib/motion"
import { safeUrl } from "@/lib/safe-url"

import { companyQuery, saveCompany, type Company } from "./api"

const LOGO: FileRules = {
  accept: [".jpg", ".jpeg", ".png", ".webp"],
  maxBytes: 5 * 1024 * 1024,
}

const KYC_TONE: Record<string, Tone> = {
  approved: "success",
  verified: "success",
  pending: "warning",
  rejected: "danger",
}

const isLinkedIn = (value: string) => {
  try {
    return /(^|\.)linkedin\.com$/i.test(new URL(value).hostname)
  } catch {
    return false
  }
}

const makeSchema = (
  m: Record<
    "email" | "address" | "industry" | "linkedin" | "description",
    string
  >
) =>
  z.object({
    official_email: z.email(m.email),
    company_address: z.string().trim().min(5, m.address),
    company_industry: z.string().min(1, m.industry),
    linkedin_url: z
      .string()
      .trim()
      .refine((value) => value === "" || isLinkedIn(value), m.linkedin),
    company_description: z.string().trim().max(500, m.description),
  })
type Values = z.infer<ReturnType<typeof makeSchema>>
const FIELDS: FieldPath<Values>[] = [
  "official_email",
  "company_address",
  "company_industry",
  "linkedin_url",
  "company_description",
]

export function CompanyProfile() {
  const { t } = useTranslation("company")
  const query = useQuery(companyQuery())
  const skeleton = useDelayed(query.isPending)
  const [editing, setEditing] = useState(false)

  if (query.isError && !query.data)
    return (
      <LoadError
        onRetry={() => void query.refetch()}
        retrying={query.isRefetching}
      />
    )
  if (!query.data)
    return skeleton ? (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    ) : null

  const company = query.data
  const kyc = company.kyc ?? {}
  const status = kyc.kyc_status?.toLowerCase() ?? null

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Logo src={safeUrl(kyc.company_logo)} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h1
            tabIndex={-1}
            className="text-2xl font-semibold tracking-tight text-balance outline-none sm:text-3xl"
          >
            {kyc.company_name ?? t("unnamed")}
          </h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {status && (
              <StatusBadge tone={KYC_TONE[status] ?? "neutral"}>
                {t(`kyc.${status}`, { defaultValue: kyc.kyc_status ?? "" })}
              </StatusBadge>
            )}
            <span className="tabular-nums">
              {t("jobs", {
                open: company.open_jobs_posted,
                count: company.total_jobs_posted,
              })}
            </span>
          </p>
        </div>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={editing ? "edit" : "view"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: duration.fast, ease }}
        >
          {editing ? (
            <EditCompany
              company={company}
              onDone={() => {
                setEditing(false)
              }}
            />
          ) : (
            <ViewCompany
              company={company}
              onEdit={() => {
                setEditing(true)
              }}
            />
          )}
        </m.div>
      </AnimatePresence>

      <Section title={t("account.title")}>
        <dl className="grid gap-4 sm:grid-cols-3">
          <Fact label={t("account.name")}>
            {company.full_name ?? company.name}
          </Fact>
          <Fact label={t("account.email")}>{company.email}</Fact>
          <Fact label={t("account.phone")}>{company.phone_number}</Fact>
        </dl>
      </Section>

      <Section title={t("legal.title")} note={t("legal.note")}>
        <dl className="grid gap-4 sm:grid-cols-3">
          <Fact label={t("legal.registration")}>
            {kyc.company_registration_number}
          </Fact>
          <Fact label={t("legal.gst")}>{kyc.gst_number}</Fact>
          <Fact label={t("legal.pan")}>{kyc.pan_number}</Fact>
        </dl>
        <Documents company={company} />
      </Section>
    </div>
  )
}

function ViewCompany({
  company,
  onEdit,
}: {
  company: Company
  onEdit: () => void
}) {
  const { t } = useTranslation("company")
  const industries = useQuery(industriesQuery())
  const kyc = company.kyc ?? {}
  const industry =
    industries.data?.find((item) => item.value === kyc.company_industry)
      ?.label ?? kyc.company_industry
  const website = safeUrl(kyc.company_website)
  const linkedin = safeUrl(kyc.linkedin_url)

  return (
    <Section
      title={t("details.title")}
      action={
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil />
          {t("details.edit")}
        </Button>
      }
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <Fact label={t("details.email")}>{kyc.official_email}</Fact>
        <Fact label={t("details.industry")}>{industry}</Fact>
        <Fact label={t("details.website")}>
          {website && (
            <Outbound href={website}>{new URL(website).host}</Outbound>
          )}
        </Fact>
        <Fact label={t("details.linkedin")}>
          {linkedin && (
            <Outbound href={linkedin}>{t("details.linkedinOpen")}</Outbound>
          )}
        </Fact>
        <Fact label={t("details.address")} wide>
          {kyc.company_address}
        </Fact>
        <Fact label={t("details.description")} wide>
          {kyc.company_description && (
            <span className="max-w-prose text-pretty whitespace-pre-line">
              {kyc.company_description}
            </span>
          )}
        </Fact>
      </dl>
    </Section>
  )
}

function EditCompany({
  company,
  onDone,
}: {
  company: Company
  onDone: () => void
}) {
  const { t } = useTranslation(["company", "common"])
  const queryClient = useQueryClient()
  const industries = useQuery(industriesQuery())
  const kyc = company.kyc ?? {}
  const industryId = useId()
  const descriptionId = useId()
  const [logo, setLogo] = useState<File | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const schema = useMemo(
    () =>
      makeSchema({
        email: t("errors.email"),
        address: t("errors.address"),
        industry: t("errors.industry"),
        linkedin: t("errors.linkedin"),
        description: t("errors.description"),
      }),
    [t]
  )
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      official_email: kyc.official_email ?? "",
      company_address: kyc.company_address ?? "",
      company_industry: kyc.company_industry ?? "",
      linkedin_url: kyc.linkedin_url ?? "",
      company_description: kyc.company_description ?? "",
    },
    mode: "onSubmit",
  })
  const errors = form.formState.errors
  const items = industries.data ?? []

  const save = useMutation({
    mutationFn: (values: Values) =>
      saveCompany({ ...values, company_logo: logo }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: companyQuery().queryKey,
      })
      toast.success(t("saved"))
      onDone()
    },
    onError: (error) => {
      const fields = error instanceof HttpError ? error.fieldErrors : undefined
      let placed = false
      for (const name of FIELDS) {
        const message = fields?.[name]
        if (!message) continue
        form.setError(name, { message })
        placed = true
      }
      if (fields?.company_logo) {
        setLogoError(fields.company_logo)
        placed = true
      }
      if (!placed) toast.error(t("saveFailed"))
    },
  })

  return (
    <Section title={t("details.title")}>
      <form
        noValidate
        className="flex max-w-2xl flex-col gap-6"
        onSubmit={(event) => {
          void form.handleSubmit((values) => {
            if (!logoError) save.mutate(values)
          })(event)
        }}
      >
        <LogoPicker
          current={safeUrl(kyc.company_logo)}
          file={logo}
          error={logoError}
          onPick={(file, problem) => {
            setLogo(problem ? null : file)
            setLogoError(problem)
          }}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label={t("details.email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            error={errors.official_email?.message}
            {...checkOnBlur(form, "official_email")}
          />
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
                    className="w-full"
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
                <FieldError>{errors.company_industry?.message}</FieldError>
              </Field>
            )}
          />
        </div>
        <TextField
          label={t("details.linkedin")}
          type="url"
          inputMode="url"
          error={errors.linkedin_url?.message}
          {...checkOnBlur(form, "linkedin_url")}
        />
        <TextField
          label={t("details.address")}
          autoComplete="street-address"
          error={errors.company_address?.message}
          {...checkOnBlur(form, "company_address")}
        />
        <Field data-invalid={Boolean(errors.company_description)}>
          <FieldLabel htmlFor={descriptionId}>
            {t("details.description")}
          </FieldLabel>
          <Textarea
            id={descriptionId}
            rows={5}
            aria-invalid={Boolean(errors.company_description)}
            {...form.register("company_description")}
          />
          <FieldDescription>{t("details.descriptionHint")}</FieldDescription>
          <FieldError>{errors.company_description?.message}</FieldError>
        </Field>
        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? t("saving") : t("save")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={save.isPending}
            onClick={onDone}
          >
            {t("common:confirm.cancel")}
          </Button>
        </div>
      </form>
    </Section>
  )
}

function LogoPicker({
  current,
  file,
  error,
  onPick,
}: {
  current: string | null
  file: File | null
  error: string | null
  onPick: (file: File | null, problem: string | null) => void
}) {
  const { t } = useTranslation("company")
  const id = useId()
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{t("logo.label")}</FieldLabel>
      <div className="flex flex-wrap items-center gap-5">
        <Logo src={current} file={file} size="lg" />
        {/* how it shows in lists, cropped to a square */}
        <Logo src={current} file={file} size="sm" />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={id}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border bg-background px-2.5 text-sm font-medium hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
          >
            <ImageUp className="size-4" aria-hidden="true" />
            {current || file ? t("logo.replace") : t("logo.upload")}
            <input
              id={id}
              type="file"
              accept={LOGO.accept.join(",")}
              className="sr-only"
              aria-describedby={`${id}-hint`}
              onChange={(event) => {
                const picked = event.target.files?.[0] ?? null
                if (!picked) return
                const problem = checkFile(picked, LOGO)
                onPick(
                  picked,
                  problem
                    ? problem.kind === "tooLarge"
                      ? t("logo.tooLarge")
                      : t("logo.wrongType")
                    : null
                )
              }}
            />
          </label>
          <FieldDescription id={`${id}-hint`}>
            {t("logo.hint")}
          </FieldDescription>
        </div>
      </div>
      <FieldError>{error}</FieldError>
    </Field>
  )
}

function Logo({
  src,
  file = null,
  size,
}: {
  src: string | null
  file?: File | null
  size: "sm" | "lg"
}) {
  // the object URL lives exactly as long as the img
  const attach = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img || !file) return
      const url = URL.createObjectURL(file)
      img.src = url
      return () => {
        URL.revokeObjectURL(url)
      }
    },
    [file]
  )
  return (
    <span
      className={
        size === "lg"
          ? "flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted"
          : "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted"
      }
    >
      {file ? (
        <img ref={attach} alt="" className="size-full object-cover" />
      ) : src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <Building2
          className={
            size === "lg"
              ? "size-8 text-muted-foreground"
              : "size-4 text-muted-foreground"
          }
          aria-hidden="true"
        />
      )}
    </span>
  )
}

function Documents({ company }: { company: Company }) {
  const { t } = useTranslation("company")
  const kyc = company.kyc ?? {}
  const docs = [
    ["registration_certificate", kyc.registration_certificate],
    ["gst_certificate", kyc.gst_certificate],
    ["address_proof", kyc.address_proof],
    ["bank_proof", kyc.bank_proof],
  ] as const
  const present = docs.flatMap(([key, url]) => {
    const href = safeUrl(url)
    return href ? [{ key, href }] : []
  })
  if (present.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-2">
      {present.map(({ key, href }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            <FileText
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            {t(`documents.${key}`)}
          </a>
        </li>
      ))}
    </ul>
  )
}

function Section({
  title,
  note,
  action,
  children,
}: {
  title: string
  note?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-medium">{title}</h2>
          {note && <p className="text-sm text-muted-foreground">{note}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function Fact({
  label,
  wide = false,
  children,
}: {
  label: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={
        wide ? "flex flex-col gap-1 sm:col-span-2" : "flex flex-col gap-1"
      }
    >
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children ?? "—"}</dd>
    </div>
  )
}

function Outbound({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
    >
      {children}
      <ExternalLink
        className="size-3.5 text-muted-foreground"
        aria-hidden="true"
      />
    </a>
  )
}
