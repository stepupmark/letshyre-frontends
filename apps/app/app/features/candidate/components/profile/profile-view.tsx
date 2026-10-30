import { safeUrl } from "@workspace/api"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  Compass,
  Mail,
  MapPin,
  Phone,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react"
import type { ReactNode } from "react"

import { CopyButton } from "@/components/copy-button"
import { StatusBadge, type Tone } from "@/components/status-badge"

import { useNoticeText, useYearsText } from "../../hooks/use-profile-text"
import { addressOf, lpaOf, noticeOf, phoneOf } from "../../lib/profile-format"
import type { Profile } from "../../schemas/candidate.schema"
import { FactRow } from "./fact-row"
import { ProfileHeader, type HeaderFact } from "./profile-header"
import { BackgroundCard } from "./background-card"
import type { Doc } from "./documents"
import { Section } from "./section"
import { StatCard } from "./stat-card"

const STATUSES = {
  applied: "neutral",
  shortlisted: "info",
  interviewed: "info",
  selected: "success",
  hired: "success",
  rejected: "danger",
} as const satisfies Record<string, Tone>

const isStatus = (value: string): value is keyof typeof STATUSES =>
  value in STATUSES

/** An unlocked candidate as an employer sees them. */
export function CandidateProfileView({
  profile,
  actions,
}: {
  profile: Profile
  actions?: ReactNode
}) {
  const { t } = useTranslation("candidate")
  const years = useYearsText(profile.candidate_total_experience_years)
  const notice = useNoticeText(noticeOf(profile.candidate_notice_period))
  const name = profile.candidate_name?.trim()
    ? profile.candidate_name.trim()
    : t("profile.unnamed")
  const latest = profile.candidate_experience?.[0]
  const place =
    profile.candidate_location ?? addressOf(profile.candidate_address)
  const facts = [
    place && { icon: MapPin, text: place },
    years && { icon: BriefcaseBusiness, text: years },
    notice && { icon: CalendarClock, text: notice },
  ].filter((fact): fact is HeaderFact => Boolean(fact))
  const docs = (
    [
      ["resume", t("profile.resume"), profile.candidate_resume],
      ["proof", t("profile.noticeProof"), profile.candidate_notice_period_prof],
    ] as const
  ).flatMap(([key, label, url]): Doc[] => {
    const href = safeUrl(url)
    return href ? [{ key, label, href }] : []
  })
  const pay = (n: number | null) =>
    n == null ? "—" : t("profile.lpa", { value: lpaOf(n) })

  return (
    <article className="flex flex-col gap-8">
      <ProfileHeader
        name={name}
        photo={safeUrl(profile.candidate_profile_photo)}
        verified={Boolean(profile.candidate_is_verified)}
        headline={[latest?.role, latest?.company].filter(Boolean).join(" · ")}
        facts={facts}
        aside={actions}
      />
      <Contact profile={profile} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <BackgroundCard
          jobs={profile.candidate_experience}
          schools={profile.candidate_education}
          projects={profile.candidate_projects}
          skills={profile.candidate_skills}
          awards={profile.candidate_certifications}
          docs={docs}
          empty={t("profile.empty")}
        />
        <div className="grid grid-cols-2 gap-3 self-start lg:grid-cols-1">
          <StatCard
            icon={Wallet}
            label={t("profile.currentPay")}
            value={pay(profile.candidate_current_ctc)}
            delay={80}
          />
          <StatCard
            icon={TrendingUp}
            label={t("profile.expectedPay")}
            value={pay(profile.candidate_expected_ctc)}
            delay={140}
          />
          <div className="col-span-2 lg:col-span-1">
            <StatCard
              icon={Target}
              label={t("profile.desiredPay")}
              value={pay(profile.candidate_desired_ctc)}
              delay={200}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Preferences profile={profile} />
        <Applied profile={profile} />
      </div>
    </article>
  )
}

function Contact({ profile }: { profile: Profile }) {
  const { t } = useTranslation("candidate")
  const email = profile.candidate_email?.trim()
  const phone = phoneOf(profile.candidate_phone)

  return (
    <section aria-label={t("profile.contact")} className="settle delay-75">
      <dl className="grid gap-5 rounded-lg border p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
        <FactRow icon={Mail} label={t("profile.email")}>
          {email && (
            <span className="flex min-w-0 items-center gap-2">
              <a
                href={`mailto:${email}`}
                className="truncate underline-offset-4 hover:text-brand-text hover:underline"
              >
                {email}
              </a>
              <span className="print:hidden">
                <CopyButton value={email} label={t("profile.copy")} />
              </span>
            </span>
          )}
        </FactRow>
        <FactRow icon={Phone} label={t("profile.phone")}>
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              dir="ltr"
              className="underline-offset-4 hover:text-brand-text hover:underline"
            >
              {phone}
            </a>
          )}
        </FactRow>
        <FactRow icon={MapPin} label={t("profile.address")}>
          {addressOf(profile.candidate_address) ?? profile.candidate_location}
        </FactRow>
      </dl>
    </section>
  )
}

function Preferences({ profile }: { profile: Profile }) {
  const { t } = useTranslation("candidate")
  const locale = useLocale()
  const places = profile.candidate_preferred_locations ?? []
  const industry = profile.candidate_preferred_industry
  if (places.length === 0 && !industry) return null

  return (
    <Section title={t("own.preferences.title")} icon={Target} boxed delay={200}>
      <dl className="flex flex-col gap-4">
        {industry && (
          <FactRow icon={Compass} label={t("own.preferences.industry")}>
            {industry}
          </FactRow>
        )}
        {places.length > 0 && (
          <FactRow icon={MapPin} label={t("own.preferences.places")}>
            {new Intl.ListFormat(locale).format(places)}
          </FactRow>
        )}
      </dl>
    </Section>
  )
}

function Applied({ profile }: { profile: Profile }) {
  const { t } = useTranslation("candidate")
  const roles = profile.candidate_roles_applied ?? []
  if (roles.length === 0) return null

  return (
    <Section
      title={t("profile.applied")}
      icon={ClipboardList}
      boxed
      delay={260}
    >
      <ul className="flex flex-col divide-y text-sm">
        {roles.map((role) => {
          const status = role.status?.trim().toLowerCase() ?? ""
          return (
            <li
              key={`${role.job_title ?? ""}|${role.status ?? ""}`}
              className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <span className="min-w-0 truncate font-medium">
                {role.job_title ?? "—"}
              </span>
              {role.status && (
                <StatusBadge
                  tone={isStatus(status) ? STATUSES[status] : "neutral"}
                >
                  {isStatus(status)
                    ? t(`profile.status.${status}`)
                    : role.status}
                </StatusBadge>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
