import { CalendarClock, CalendarDays, Briefcase, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatLpa, getNoticePeriod, formatDate } from "@/features/candidate-profile/components/utils";
import {
  InfoPanel,
  InfoRow,
  CtcCards as SharedCtcCards,
  PreferredLocationsCard as SharedPreferredLocationsCard,
} from "@/features/candidate-profile/components/InfoPanels";
import { useAppLocale } from "@/i18n/appLocale";

export function CtcCards({ current, expected }) {
  const { t } = useTranslation("employee");
  const { locale } = useAppLocale();
  return (
    <SharedCtcCards
      currentLabel={t("profile.currentCtc")}
      currentValue={formatLpa(current, locale)}
      expectedLabel={t("profile.expectedCtc")}
      expectedValue={formatLpa(expected, locale)}
    />
  );
}

export function NoticePeriodCard({ lastWorkingDay }) {
  const { t } = useTranslation("employee");
  const { t: tProfile } = useTranslation("candidateProfile");
  const { locale } = useAppLocale();
  return (
    <InfoPanel heading={t("profile.noticePeriod")}>
      <InfoRow
        icon={CalendarClock}
        label={t("profile.availability")}
        value={getNoticePeriod(lastWorkingDay, tProfile)}
        valueClassName="text-success"
      />
      {lastWorkingDay && (
        <InfoRow
          icon={CalendarDays}
          label={t("profile.lastWorkingDay")}
          value={formatDate(lastWorkingDay, locale)}
        />
      )}
    </InfoPanel>
  );
}

export function PreferredLocationsCard({ locations }) {
  const { t } = useTranslation("employee");
  return (
    <SharedPreferredLocationsCard
      heading={t("profile.preferredLocations")}
      locations={locations}
    />
  );
}

export function PreferencesCard({ role, industry }) {
  const { t } = useTranslation("employee");
  if (!role && !industry) return null;
  return (
    <InfoPanel heading={t("profile.preferences")}>
      {role && <InfoRow icon={Briefcase} label={t("profile.role")} value={role} />}
      {industry && <InfoRow icon={Building2} label={t("profile.industry")} value={industry} />}
    </InfoPanel>
  );
}
