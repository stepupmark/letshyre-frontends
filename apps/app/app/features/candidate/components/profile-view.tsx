import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import {
  BadgeCheck,
  Briefcase,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Phone,
} from "lucide-react"
import type { ReactNode } from "react"

import { CopyButton } from "@/components/copy-button"
import { StatusBadge } from "@/components/status-badge"
import { safeUrl } from "@/lib/safe-url"

import type { Profile } from "../schemas/candidate.schema"

const hasItems = <T,>(list: T[] | null | undefined): list is T[] =>
  Array.isArray(list) && list.length > 0

const titleOf = (
  item:
    | string
    | { name?: string | null; title?: string | null; issuer?: string | null }
) =>
  typeof item === "string"
    ? { title: item, issuer: null }
    : { title: item.name ?? item.title ?? "", issuer: item.issuer ?? null }

// numbers without a country code are Indian
const phoneOf = (raw: string | number | null | undefined) => {
  const digits = String(raw ?? "").trim()
  if (!digits) return null
  return digits.startsWith("+") ? digits : `+91 ${digits}`
}

const addressOf = (raw: unknown): string | null => {
  if (typeof raw === "string") return raw.trim() || null
  if (raw && typeof raw === "object")
    return (
      Object.values(raw)
        .filter((part) => typeof part === "string" && part.trim())
        .join(", ") || null
    )
  return null
}

const lpa = (n: number) =>
  Number.isInteger(n) ? String(n) : (Math.round(n * 10) / 10).toString()

const ROLE_TONE: Record<string, "success" | "danger" | "info" | "neutral"> = {
  hired: "success",
  selected: "success",
  shortlisted: "info",
  rejected: "danger",
}

export function CandidateProfileView({
  profile,
  actions,
}: {
  profile: Profile
  actions?: ReactNode
}) {
  const { t } = useTranslation("candidate")
  const name = profile.candidate_name?.trim()
    ? profile.candidate_name.trim()
    : t("profile.unnamed")
  const photo = safeUrl(profile.candidate_profile_photo)
  const latest = profile.candidate_experience?.[0]
  const headline = [latest?.role, latest?.company].filter(Boolean).join(" · ")

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
            {profile.candidate_is_verified && (
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
        {actions && (
          <div className="flex flex-wrap gap-2 self-start sm:self-center print:hidden">
            {actions}
          </div>
        )}
      </header>

      <Contact profile={profile} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-10">
          <Background profile={profile} />
        </div>
        <aside className="flex flex-col gap-8">
          <Facts profile={profile} />
        </aside>
      </div>
    </article>
  )
}

function Contact({ profile }: { profile: Profile }) {
  const { t } = useTranslation("candidate")
  const email = profile.candidate_email?.trim()
  const phone = phoneOf(profile.candidate_phone)
  const place =
    profile.candidate_location ?? addressOf(profile.candidate_address)
  const years = profile.candidate_total_experience_years

  return (
    <section aria-label={t("profile.contact")}>
      <dl className="grid divide-y rounded-lg border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        <Item icon={<Mail />} label={t("profile.email")}>
          {email ? (
            <span className="flex min-w-0 items-center justify-between gap-2">
              <a
                href={`mailto:${email}`}
                className="truncate underline-offset-4 hover:underline"
              >
                {email}
              </a>
              <span className="print:hidden">
                <CopyButton value={email} label={t("profile.copy")} />
              </span>
            </span>
          ) : (
            "—"
          )}
        </Item>
        <Item icon={<Phone />} label={t("profile.phone")}>
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              dir="ltr"
              className="underline-offset-4 hover:underline"
            >
              {phone}
            </a>
          ) : (
            "—"
          )}
        </Item>
        <Item icon={<MapPin />} label={t("profile.location")}>
          {place ?? "—"}
        </Item>
        <Item icon={<Briefcase />} label={t("profile.experience")}>
          {years === null
            ? "—"
            : years === 0
              ? t("profile.fresher")
              : t("profile.years", { count: Math.round(years * 10) / 10 })}
        </Item>
      </dl>
    </section>
  )
}

function Item({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 p-4">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground [&_svg]:size-3.5">
        {icon}
        {label}
      </dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  )
}

type BackgroundFields = Pick<
  Profile,
  | "candidate_skills"
  | "candidate_experience"
  | "candidate_education"
  | "candidate_projects"
  | "candidate_certifications"
>

export function Background({
  profile,
  empty: emptyText,
}: {
  profile: BackgroundFields
  empty?: string
}) {
  const { t } = useTranslation("candidate")
  const skills = (profile.candidate_skills ?? [])
    .map((skill) => titleOf(skill).title)
    .filter(Boolean)
  const awards = (profile.candidate_certifications ?? [])
    .map(titleOf)
    .filter((item) => item.title)
  const empty =
    skills.length === 0 &&
    !hasItems(profile.candidate_experience) &&
    !hasItems(profile.candidate_education) &&
    !hasItems(profile.candidate_projects) &&
    awards.length === 0

  if (empty)
    return (
      <p className="text-sm text-muted-foreground">
        {emptyText ?? t("profile.empty")}
      </p>
    )

  return (
    <>
      {skills.length > 0 && (
        <Group title={t("profile.skills")}>
          <ul className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <li key={skill}>
                <Badge variant="outline">{skill}</Badge>
              </li>
            ))}
          </ul>
        </Group>
      )}
      {hasItems(profile.candidate_experience) && (
        <Group title={t("profile.work")}>
          <ol className="flex flex-col gap-5 border-s ps-5">
            {profile.candidate_experience.map((job, i) => (
              <li key={i} className="relative flex flex-col gap-0.5 text-sm">
                <span
                  className={cn(
                    "absolute -inset-s-6.25 top-1.5 size-2 rounded-full",
                    i === 0 ? "bg-brand" : "bg-border"
                  )}
                  aria-hidden="true"
                />
                <span className="font-medium">{job.role ?? "—"}</span>
                <span className="text-muted-foreground">
                  {[job.company, job.duration].filter(Boolean).join(" · ")}
                </span>
                {job.description && (
                  <p className="mt-1 max-w-prose text-pretty">
                    {job.description}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Group>
      )}
      {hasItems(profile.candidate_education) && (
        <Group title={t("profile.education")}>
          <ul className="flex flex-col gap-4">
            {profile.candidate_education.map((school, i) => (
              <li key={i} className="flex flex-col gap-0.5 text-sm">
                <span className="font-medium">{school.institution ?? "—"}</span>
                <span className="text-muted-foreground">
                  {[school.degree, school.duration].filter(Boolean).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </Group>
      )}
      {hasItems(profile.candidate_projects) && (
        <Group title={t("profile.projects")}>
          <ul className="flex flex-col gap-4">
            {profile.candidate_projects.map((project, i) => (
              <li key={i} className="flex flex-col gap-0.5 text-sm">
                <span className="font-medium">
                  {project.title ?? project.name ?? t("profile.untitled")}
                </span>
                {project.description && (
                  <p className="max-w-prose text-pretty text-muted-foreground">
                    {project.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Group>
      )}
      {awards.length > 0 && (
        <Group title={t("profile.awards")}>
          <ul className="flex flex-col gap-2 text-sm">
            {awards.map((award, i) => (
              <li key={i}>
                <span className="font-medium">{award.title}</span>
                {award.issuer && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {award.issuer}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Group>
      )}
    </>
  )
}

function Facts({ profile }: { profile: Profile }) {
  const { t } = useTranslation("candidate")
  const locale = useLocale()
  const now = profile.candidate_current_ctc
  const next = profile.candidate_expected_ctc
  const notice = profile.candidate_notice_period
  const resume = safeUrl(profile.candidate_resume)
  const proof = safeUrl(profile.candidate_notice_period_prof)
  const address = addressOf(profile.candidate_address)
  const places = profile.candidate_preferred_locations ?? []
  const roles = profile.candidate_roles_applied ?? []

  return (
    <>
      <Group title={t("profile.pay")}>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">
              {t("profile.current")}
            </dt>
            <dd className="text-lg font-semibold tabular-nums" dir="ltr">
              {now == null ? "—" : t("profile.lpa", { value: lpa(now) })}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">
              {t("profile.expected")}
            </dt>
            <dd className="text-lg font-semibold tabular-nums" dir="ltr">
              {next == null ? "—" : t("profile.lpa", { value: lpa(next) })}
            </dd>
          </div>
        </dl>
      </Group>

      <Group title={t("profile.availability")}>
        <p className="text-sm">
          {notice == null || notice === ""
            ? t("profile.notSaid")
            : typeof notice === "number" || /^\d+$/.test(notice)
              ? Number(notice) === 0
                ? t("profile.immediate")
                : t("profile.notice", {
                    count: Number(notice),
                    formatted: new Intl.NumberFormat(locale).format(
                      Number(notice)
                    ),
                  })
              : notice}
        </p>
        {places.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {t("profile.openTo", { places: places.join(", ") })}
          </p>
        )}
        {profile.candidate_preferred_industry && (
          <p className="text-sm text-muted-foreground">
            {t("profile.industry", {
              industry: profile.candidate_preferred_industry,
            })}
          </p>
        )}
      </Group>

      {roles.length > 0 && (
        <Group title={t("profile.applied")}>
          <ul className="flex flex-col gap-2 text-sm">
            {roles.map((role, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span className="truncate">{role.job_title ?? "—"}</span>
                {role.status && (
                  <StatusBadge
                    tone={ROLE_TONE[role.status.toLowerCase()] ?? "neutral"}
                  >
                    {role.status}
                  </StatusBadge>
                )}
              </li>
            ))}
          </ul>
        </Group>
      )}

      {(resume ?? proof) && (
        <Group title={t("profile.documents")}>
          <ul className="flex flex-col gap-2 text-sm">
            {resume && (
              <li>
                <Doc href={resume} icon={<FileText />}>
                  {t("profile.resume")}
                </Doc>
              </li>
            )}
            {proof && (
              <li>
                <Doc href={proof} icon={<ExternalLink />}>
                  {t("profile.noticeProof")}
                </Doc>
              </li>
            )}
          </ul>
        </Group>
      )}

      {address && (
        <Group title={t("profile.address")}>
          <p className="text-sm text-pretty">{address}</p>
        </Group>
      )}
    </>
  )
}

export function Group({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Doc({
  href,
  icon,
  children,
}: {
  href: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-flex items-center gap-2 underline-offset-4 hover:underline [&_svg]:size-4 [&_svg]:text-muted-foreground"
    >
      {icon}
      {children}
    </a>
  )
}
