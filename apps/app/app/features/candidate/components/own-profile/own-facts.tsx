import { useLocale, useTranslation } from "@workspace/i18n/react"
import {
  Building2,
  CalendarDays,
  Compass,
  Home,
  Mail,
  MapPin,
  Phone,
} from "lucide-react"

import { addressOf, phoneOf } from "../../lib/profile-format"
import type { OwnProfile } from "../../schemas/candidate.schema"
import { FactRow } from "../profile/fact-row"

export function ContactFacts({ profile }: { profile: OwnProfile }) {
  const { t } = useTranslation("candidate")
  const phone = phoneOf(profile.phone_number)
  return (
    <dl className="flex flex-col gap-4">
      <FactRow icon={Mail} label={t("profile.email")}>
        {profile.email}
      </FactRow>
      <FactRow icon={Phone} label={t("profile.phone")}>
        {phone && <span dir="ltr">{phone}</span>}
      </FactRow>
      <FactRow icon={MapPin} label={t("own.contact.city")}>
        {profile.location}
      </FactRow>
      <FactRow icon={Home} label={t("profile.address")}>
        {addressOf(profile.address)}
      </FactRow>
    </dl>
  )
}

/** Pay sits in the stat cards above; the form here still edits it. */
export function WorkFacts({ profile }: { profile: OwnProfile }) {
  const { t } = useTranslation("candidate")
  const locale = useLocale()
  const day = profile.last_day_of_working
    ? new Date(profile.last_day_of_working)
    : null
  return (
    <dl className="flex flex-col gap-4">
      <FactRow icon={Building2} label={t("own.work.company")}>
        {profile.present_or_last_working_company}
      </FactRow>
      <FactRow icon={CalendarDays} label={t("own.work.lastDay")}>
        {day && !Number.isNaN(day.getTime())
          ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(day)
          : null}
      </FactRow>
    </dl>
  )
}

export function PreferenceFacts({ profile }: { profile: OwnProfile }) {
  const { t } = useTranslation("candidate")
  const places = profile.preferred_locations ?? []
  return (
    <dl className="flex flex-col gap-4">
      <FactRow icon={Compass} label={t("own.preferences.industry")}>
        {profile.preferred_industry}
      </FactRow>
      <FactRow icon={MapPin} label={t("own.preferences.places")}>
        {places.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {places.map((place) => (
              <li
                key={place}
                className="rounded-md bg-brand-muted px-2 py-0.5 text-brand-text"
              >
                {place}
              </li>
            ))}
          </ul>
        )}
      </FactRow>
    </dl>
  )
}
