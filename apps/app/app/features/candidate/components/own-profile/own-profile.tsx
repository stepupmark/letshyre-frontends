import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useQuery } from "@tanstack/react-query"
import {
  BriefcaseBusiness,
  IndianRupee,
  Mail,
  MapPin,
  Target,
  TrendingUp,
  UserRound,
  Wallet,
} from "lucide-react"

import { LoadError } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"
import { safeUrl } from "@/lib/safe-url"

import { useYearsText } from "../../hooks/use-profile-text"
import { lpaOf } from "../../lib/profile-format"
import { ownProfileQuery } from "../../queries/candidate.queries"
import type { OwnProfile as Profile } from "../../schemas/candidate.schema"
import { BackgroundCard } from "../profile/background-card"
import type { Doc } from "../profile/documents"
import { ProfileHeader, type HeaderFact } from "../profile/profile-header"
import { Section } from "../profile/section"
import { StatCard } from "../profile/stat-card"
import { CompletionRing } from "./completion"
import { ContactFacts, PreferenceFacts, WorkFacts } from "./own-facts"

export function OwnProfile() {
  const query = useQuery(ownProfileQuery())
  const skeleton = useDelayed(query.isPending)

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

  return <Loaded profile={query.data} />
}

function Loaded({ profile }: { profile: Profile }) {
  const { t } = useTranslation("candidate")
  const years = useYearsText(profile.total_experience_years)
  const name = profile.name?.trim() ? profile.name.trim() : t("profile.unnamed")
  const latest = profile.experience?.[0]
  const facts = [
    profile.location && { icon: MapPin, text: profile.location },
    years && { icon: BriefcaseBusiness, text: years },
  ].filter((fact): fact is HeaderFact => Boolean(fact))
  const pay = (n: number | null) =>
    n == null ? "—" : t("profile.lpa", { value: lpaOf(n) })

  return (
    <article className="flex flex-col gap-8">
      <ProfileHeader
        name={name}
        photo={safeUrl(profile.profile_photo)}
        verified={Boolean(profile.is_verified)}
        headline={
          profile.role ??
          [latest?.role, latest?.company].filter(Boolean).join(" · ")
        }
        facts={facts}
        aside={<CompletionRing profile={profile} />}
      />
      <p className="settle -mb-4 flex items-center gap-2 text-sm text-pretty text-muted-foreground">
        <UserRound aria-hidden="true" className="size-4 shrink-0" />
        {t("own.fromResume")}
      </p>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <BackgroundCard
          jobs={profile.experience}
          schools={profile.education}
          projects={profile.projects}
          skills={profile.skills}
          awards={profile.certifications}
          docs={documentsOf(profile, (key) => t(`own.docs.${key}`))}
          empty={t("own.emptyBackground")}
        />
        <div className="grid grid-cols-2 gap-3 self-start lg:grid-cols-1">
          <StatCard
            icon={Wallet}
            label={t("profile.currentPay")}
            value={pay(profile.current_ctc)}
            delay={80}
          />
          <StatCard
            icon={TrendingUp}
            label={t("profile.expectedPay")}
            value={pay(profile.expected_ctc)}
            delay={140}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Section title={t("own.contact.title")} icon={Mail} boxed delay={200}>
          <ContactFacts profile={profile} />
        </Section>
        <Section
          title={t("own.work.title")}
          icon={IndianRupee}
          boxed
          delay={260}
        >
          <WorkFacts profile={profile} />
        </Section>
        <Section
          title={t("own.preferences.title")}
          icon={Target}
          boxed
          delay={320}
        >
          <PreferenceFacts profile={profile} />
        </Section>
      </div>
    </article>
  )
}

type DocKey =
  | "resume"
  | "experience_letter"
  | "resignation_letter"
  | "notice_period_prof"
  | "present_offer"

function documentsOf(profile: Profile, label: (key: DocKey) => string) {
  return (
    [
      ["resume", profile.resume],
      ["experience_letter", profile.experience_letter],
      ["resignation_letter", profile.resignation_letter],
      ["notice_period_prof", profile.notice_period_prof],
      ["present_offer", profile.present_offer],
    ] as const
  ).flatMap(([key, url]): Doc[] => {
    const href = safeUrl(url)
    return href ? [{ key, label: label(key), href }] : []
  })
}
