import { CalendarClock, Building2, Briefcase, MapPinned } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  InfoPanel,
  InfoRow,
  CtcCards as SharedCtcCards,
  PreferredLocationsCard as SharedPreferredLocationsCard,
} from "@/features/candidate-profile/components/InfoPanels";
import { useFormatters } from "@/i18n/format";

const CP_ROLE_STATUS_BASE =
  "shrink-0 rounded-full px-2.5 py-0.75 text-xs font-semibold capitalize";

// An explicit default keeps unknown statuses readable.
const CP_ROLE_STATUS_TONE = {
  selected: "bg-success-bg text-success",
  hired: "bg-success-bg text-success",
  accepted: "bg-success-bg text-success",
  rejected: "bg-danger-bg text-danger",
  pending: "bg-warning-bg text-warning",
  applied: "bg-warning-bg text-warning",
  "in-review": "bg-warning-bg text-warning",
  default: "bg-brand-100 text-brand-700",
};

const roleStatusTone = (status) =>
  CP_ROLE_STATUS_TONE[
    String(status).toLowerCase().replace(/\s+/g, "-")
  ] ?? CP_ROLE_STATUS_TONE.default;

export function CtcCards({ current, expected }) {
  const { t } = useTranslation("employerCandidates");
  const { formatCurrency } = useFormatters();
  const formatCTC = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    const num = Number(value);
    if (Number.isNaN(num)) return "—";
    return formatCurrency(num, "INR", { maximumFractionDigits: 0 });
  };
  return (
    <SharedCtcCards
      currentLabel={t("candidateProfile.currentCtc")}
      currentValue={formatCTC(current)}
      expectedLabel={t("candidateProfile.expectedCtc")}
      expectedValue={formatCTC(expected)}
    />
  );
}

export function NoticePeriodCard({ noticePeriod }) {
  const { t } = useTranslation("employerCandidates");
  return (
    <InfoPanel heading={t("candidateProfile.noticePeriodHeading")}>
      <InfoRow
        icon={CalendarClock}
        label={t("candidateProfile.availability")}
        value={noticePeriod || t("candidateProfile.notSpecified")}
        valueClassName="text-success"
      />
    </InfoPanel>
  );
}

export function PreferredLocationsCard({ locations }) {
  const { t } = useTranslation("employerCandidates");
  return (
    <SharedPreferredLocationsCard
      heading={t("candidateProfile.preferredLocations")}
      locations={locations}
    />
  );
}

export function PreferencesCard({ industry }) {
  const { t } = useTranslation("employerCandidates");
  if (!industry) return null;
  return (
    <InfoPanel heading={t("candidateProfile.preferencesHeading")}>
      <InfoRow icon={Building2} label={t("candidateProfile.industry")} value={industry} />
    </InfoPanel>
  );
}

export function AddressCard({ address }) {
  const { t } = useTranslation("employerCandidates");
  if (!address) return null;
  return (
    <InfoPanel heading={t("candidateProfile.addressHeading")}>
      <InfoRow icon={MapPinned} value={address} />
    </InfoPanel>
  );
}

export function RolesAppliedCard({ roles }) {
  const { t } = useTranslation("employerCandidates");
  if (!roles.length) return null;
  return (
    <InfoPanel heading={t("candidateProfile.rolesApplied")}>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {roles.map((role, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="grid size-7.5 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-600"
              aria-hidden="true"
            >
              <Briefcase size={16} strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1 text-sm font-semibold text-text-main">
              {role.job_title || "—"}
            </span>
            {role.status && (
              <span
                className={cn(
                  CP_ROLE_STATUS_BASE,
                  roleStatusTone(role.status),
                )}
              >
                {role.status}
              </span>
            )}
          </li>
        ))}
      </ul>
    </InfoPanel>
  );
}
