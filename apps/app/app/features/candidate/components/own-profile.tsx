import { zodResolver } from "@hookform/resolvers/zod"
import { HttpError } from "@workspace/api"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Progress } from "@workspace/ui/components/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BadgeCheck, FileText, Pencil } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useId, useMemo, useState, type ReactNode } from "react"
import {
  Controller,
  useForm,
  type FieldValues,
  type Path,
} from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { LoadError } from "@/components/query-state"
import { TextField } from "@/components/text-field"
import { useDelayed } from "@/hooks/use-delayed"
import { checkOnBlur } from "@/lib/forms"
import { industriesQuery } from "@/lib/industries"
import { duration, ease } from "@/lib/motion"
import { safeUrl } from "@/lib/safe-url"

import { ownProfileQuery } from "../queries/candidate.queries"
import { saveOwnProfile } from "../services/candidate.service"
import { type OwnProfile } from "../schemas/candidate.schema"
import { Background, Group } from "./profile-view"

type SectionKey = "contact" | "work" | "preferences"

const addressOf = (raw: unknown) =>
  typeof raw === "string"
    ? raw
    : raw && typeof raw === "object"
      ? Object.values(raw)
          .filter((part) => typeof part === "string" && part.trim())
          .join(", ")
      : ""

const lpa = (n: number | null | undefined) =>
  n == null ? "" : String(Math.round(n * 100) / 100)

export function OwnProfile() {
  const { t } = useTranslation("candidate")
  const query = useQuery(ownProfileQuery())
  const skeleton = useDelayed(query.isPending)
  const [editing, setEditing] = useState<SectionKey | null>(null)

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
        <Skeleton className="h-20" />
        <Skeleton className="h-72" />
      </div>
    ) : null

  const profile = query.data
  const name = profile.name?.trim() ? profile.name.trim() : t("profile.unnamed")
  const photo = safeUrl(profile.profile_photo)
  const latest = profile.experience?.[0]
  const headline =
    profile.role ?? [latest?.role, latest?.company].filter(Boolean).join(" · ")
  const section = (key: SectionKey) => ({
    editing: editing === key,
    onEdit: () => {
      setEditing(key)
    },
    onDone: () => {
      setEditing(null)
    },
  })

  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar className="size-16 sm:size-20">
          {photo && <AvatarImage src={photo} alt="" />}
          <AvatarFallback className="text-xl text-foreground">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h1
            tabIndex={-1}
            className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-balance outline-none sm:text-3xl"
          >
            {name}
            {profile.is_verified && (
              <BadgeCheck
                className="size-5 shrink-0 text-info"
                aria-label={t("profile.verified")}
              />
            )}
          </h1>
          {headline && (
            <p className="text-sm text-muted-foreground">{headline}</p>
          )}
        </div>
      </header>

      <Standing profile={profile} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-10">
          <p className="-mb-4 text-sm text-muted-foreground">
            {t("own.fromResume")}
          </p>
          <Background
            profile={{
              candidate_skills: profile.skills,
              candidate_experience: profile.experience,
              candidate_education: profile.education,
              candidate_projects: profile.projects,
              candidate_certifications: profile.certifications,
            }}
            empty={t("own.emptyBackground")}
          />
          <Documents profile={profile} />
        </div>
        <aside className="flex flex-col gap-8">
          <Editable
            title={t("own.contact.title")}
            {...section("contact")}
            view={
              <dl className="grid gap-3">
                <Fact label={t("profile.email")}>{profile.email}</Fact>
                <Fact label={t("profile.phone")}>
                  {profile.phone_number && (
                    <span dir="ltr">{String(profile.phone_number)}</span>
                  )}
                </Fact>
                <Fact label={t("own.contact.city")}>{profile.location}</Fact>
                <Fact label={t("profile.address")}>
                  {addressOf(profile.address)}
                </Fact>
              </dl>
            }
            form={(done) => <ContactForm profile={profile} onDone={done} />}
          />
          <Editable
            title={t("own.work.title")}
            {...section("work")}
            view={
              <dl className="grid grid-cols-2 gap-3">
                <Fact label={t("own.work.company")} wide>
                  {profile.present_or_last_working_company}
                </Fact>
                <Fact label={t("profile.current")}>
                  {profile.current_ctc != null &&
                    t("profile.lpa", { value: lpa(profile.current_ctc) })}
                </Fact>
                <Fact label={t("profile.expected")}>
                  {profile.expected_ctc != null &&
                    t("profile.lpa", { value: lpa(profile.expected_ctc) })}
                </Fact>
                <Fact label={t("own.work.lastDay")} wide>
                  <DateText iso={profile.last_day_of_working} />
                </Fact>
              </dl>
            }
            form={(done) => <WorkForm profile={profile} onDone={done} />}
          />
          <Editable
            title={t("own.preferences.title")}
            {...section("preferences")}
            view={
              <dl className="grid gap-3">
                <Fact label={t("own.preferences.industry")}>
                  {profile.preferred_industry}
                </Fact>
                <Fact label={t("own.preferences.places")}>
                  {profile.preferred_locations?.join(", ")}
                </Fact>
              </dl>
            }
            form={(done) => <PreferencesForm profile={profile} onDone={done} />}
          />
        </aside>
      </div>
    </article>
  )
}

function Standing({ profile }: { profile: OwnProfile }) {
  const { t } = useTranslation("candidate")
  const score = Math.min(
    100,
    Math.max(0, profile.profile_completion_score ?? 0)
  )
  const used = profile.interview_attempts_used
  const max = profile.max_interviews_allowed
  return (
    <dl className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 sm:p-5">
      <div className="flex flex-col gap-2">
        <dt className="text-sm text-muted-foreground">{t("own.completion")}</dt>
        <dd className="flex items-center gap-3">
          <Progress
            value={score}
            aria-label={t("own.completion")}
            className="flex-1"
          />
          <span className="text-sm font-medium tabular-nums">{score}%</span>
        </dd>
      </div>
      {used != null && max != null && max > 0 && (
        <div className="flex flex-col gap-2">
          <dt className="text-sm text-muted-foreground">
            {t("own.interviews")}
          </dt>
          <dd className="text-sm">
            <span className="font-medium tabular-nums">
              {t("own.interviewsUsed", { used, max })}
            </span>{" "}
            <span className="text-muted-foreground">
              {t("own.interviewsLeft", { count: Math.max(0, max - used) })}
            </span>
          </dd>
        </div>
      )}
    </dl>
  )
}

function Editable({
  title,
  editing,
  onEdit,
  onDone,
  view,
  form,
}: {
  title: string
  editing: boolean
  onEdit: () => void
  onDone: () => void
  view: ReactNode
  form: (done: () => void) => ReactNode
}) {
  const { t } = useTranslation("candidate")
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </h2>
        {!editing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            aria-label={t("own.edit", { section: title })}
          >
            <Pencil />
            {t("own.editShort")}
          </Button>
        )}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={editing ? "edit" : "view"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: duration.fast, ease }}
        >
          {editing ? form(onDone) : view}
        </m.div>
      </AnimatePresence>
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
        wide ? "col-span-2 flex flex-col gap-0.5" : "flex flex-col gap-0.5"
      }
    >
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-pretty">{children ?? "—"}</dd>
    </div>
  )
}

function DateText({ iso }: { iso: string | null | undefined }) {
  const locale = useLocale()
  const date = iso ? new Date(iso) : null
  if (!date || Number.isNaN(date.getTime())) return null
  return (
    <>{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)}</>
  )
}

function Documents({ profile }: { profile: OwnProfile }) {
  const { t } = useTranslation("candidate")
  const docs = (
    [
      ["resume", profile.resume],
      ["experience_letter", profile.experience_letter],
      ["resignation_letter", profile.resignation_letter],
      ["notice_period_prof", profile.notice_period_prof],
      ["present_offer", profile.present_offer],
    ] as const
  ).flatMap(([key, url]) => {
    const href = safeUrl(url)
    return href ? [{ key, href }] : []
  })
  if (docs.length === 0) return null
  return (
    <Group title={t("profile.documents")}>
      <ul className="flex flex-wrap gap-2">
        {docs.map(({ key, href }) => (
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
              {t(`own.docs.${key}`)}
            </a>
          </li>
        ))}
      </ul>
    </Group>
  )
}

/** One section's form: saves only its own fields and puts server errors on them. */
function useSectionForm<T extends FieldValues>({
  schema,
  defaults,
  toFields,
  onDone,
}: {
  schema: z.ZodType<T, T>
  defaults: T
  toFields: (values: T) => Record<string, string>
  onDone: () => void
}) {
  const { t } = useTranslation("candidate")
  const queryClient = useQueryClient()
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaults as never,
    mode: "onSubmit",
  })
  const save = useMutation({
    mutationFn: (values: T) => saveOwnProfile(toFields(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ownProfileQuery().queryKey,
      })
      toast.success(t("own.saved"))
      onDone()
    },
    onError: (error) => {
      const fields = error instanceof HttpError ? error.fieldErrors : undefined
      let placed = false
      for (const name of Object.keys(defaults)) {
        const message = fields?.[name]
        if (!message) continue
        form.setError(name as Path<T>, { message })
        placed = true
      }
      if (!placed) toast.error(t("own.saveFailed"))
    },
  })
  const submit = form.handleSubmit((values) => {
    save.mutate(values)
  })
  return { form, save, submit }
}

function FormShell({
  pending,
  onSubmit,
  onCancel,
  children,
}: {
  pending: boolean
  onSubmit: () => void
  onCancel: () => void
  children: ReactNode
}) {
  const { t } = useTranslation(["candidate", "common"])
  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      {children}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? t("own.saving") : t("own.save")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={onCancel}
        >
          {t("common:confirm.cancel")}
        </Button>
      </div>
    </form>
  )
}

function ContactForm({
  profile,
  onDone,
}: {
  profile: OwnProfile
  onDone: () => void
}) {
  const { t } = useTranslation("candidate")
  const schema = useMemo(
    () =>
      z.object({
        location: z.string().trim().min(2, t("own.errors.city")),
        address: z.string().trim().min(10, t("own.errors.address")),
      }),
    [t]
  )
  const { form, save, submit } = useSectionForm({
    schema,
    defaults: {
      location: profile.location ?? "",
      address: addressOf(profile.address),
    },
    toFields: (values) => values,
    onDone,
  })
  const errors = form.formState.errors
  return (
    <FormShell
      pending={save.isPending}
      onSubmit={() => void submit()}
      onCancel={onDone}
    >
      <TextField
        label={t("own.contact.city")}
        autoComplete="address-level2"
        error={errors.location?.message}
        {...checkOnBlur(form, "location")}
      />
      <TextField
        label={t("profile.address")}
        autoComplete="street-address"
        error={errors.address?.message}
        {...checkOnBlur(form, "address")}
      />
    </FormShell>
  )
}

const amount = (message: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{1,3}(\.\d{1,2})?$/, message)

function WorkForm({
  profile,
  onDone,
}: {
  profile: OwnProfile
  onDone: () => void
}) {
  const { t } = useTranslation("candidate")
  const schema = useMemo(
    () =>
      z
        .object({
          present_or_last_working_company: z
            .string()
            .trim()
            .min(1, t("own.errors.company")),
          current_ctc: amount(t("own.errors.ctc")),
          expected_ctc: amount(t("own.errors.ctc")),
          last_day_of_working: z.string().min(1, t("own.errors.lastDay")),
        })
        .refine(
          (values) => Number(values.expected_ctc) >= Number(values.current_ctc),
          { path: ["expected_ctc"], message: t("own.errors.expectedLow") }
        ),
    [t]
  )
  const { form, save, submit } = useSectionForm({
    schema,
    defaults: {
      present_or_last_working_company:
        profile.present_or_last_working_company ?? "",
      current_ctc: lpa(profile.current_ctc),
      expected_ctc: lpa(profile.expected_ctc),
      last_day_of_working: profile.last_day_of_working?.slice(0, 10) ?? "",
    },
    toFields: (values) => values,
    onDone,
  })
  const errors = form.formState.errors
  return (
    <FormShell
      pending={save.isPending}
      onSubmit={() => void submit()}
      onCancel={onDone}
    >
      <TextField
        label={t("own.work.company")}
        autoComplete="organization"
        error={errors.present_or_last_working_company?.message}
        {...checkOnBlur(form, "present_or_last_working_company")}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label={t("own.work.currentLpa")}
          inputMode="decimal"
          error={errors.current_ctc?.message}
          {...checkOnBlur(form, "current_ctc")}
        />
        <TextField
          label={t("own.work.expectedLpa")}
          inputMode="decimal"
          error={errors.expected_ctc?.message}
          {...form.register("expected_ctc")}
        />
      </div>
      <TextField
        label={t("own.work.lastDay")}
        type="date"
        error={errors.last_day_of_working?.message}
        {...form.register("last_day_of_working")}
      />
    </FormShell>
  )
}

function PreferencesForm({
  profile,
  onDone,
}: {
  profile: OwnProfile
  onDone: () => void
}) {
  const { t } = useTranslation("candidate")
  const industryId = useId()
  const industries = useQuery(industriesQuery())
  const items = industries.data ?? []
  const schema = useMemo(
    () =>
      z.object({
        preferred_industry: z.string().min(1, t("own.errors.industry")),
        preferred_locations: z
          .string()
          .refine(
            (value) => value.split(",").some((place) => place.trim()),
            t("own.errors.places")
          ),
      }),
    [t]
  )
  const { form, save, submit } = useSectionForm({
    schema,
    defaults: {
      preferred_industry: profile.preferred_industry ?? "",
      preferred_locations: profile.preferred_locations?.join(", ") ?? "",
    },
    toFields: (values) => ({
      preferred_industry: values.preferred_industry,
      preferred_locations: JSON.stringify([
        ...new Set(
          values.preferred_locations
            .split(",")
            .map((place) => place.trim())
            .filter(Boolean)
        ),
      ]),
    }),
    onDone,
  })
  const errors = form.formState.errors
  return (
    <FormShell
      pending={save.isPending}
      onSubmit={() => void submit()}
      onCancel={onDone}
    >
      <Controller
        control={form.control}
        name="preferred_industry"
        render={({ field }) => (
          <Field data-invalid={Boolean(errors.preferred_industry)}>
            <FieldLabel htmlFor={industryId}>
              {t("own.preferences.industry")}
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
                aria-invalid={Boolean(errors.preferred_industry)}
              >
                <SelectValue placeholder={t("own.preferences.choose")} />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError>{errors.preferred_industry?.message}</FieldError>
          </Field>
        )}
      />
      <TextField
        label={t("own.preferences.places")}
        hint={t("own.preferences.placesHint")}
        error={errors.preferred_locations?.message}
        {...checkOnBlur(form, "preferred_locations")}
      />
    </FormShell>
  )
}
