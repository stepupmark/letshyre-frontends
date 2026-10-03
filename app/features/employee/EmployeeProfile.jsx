import { useTranslation } from "react-i18next";
import { useCandidateProfile } from "@/features/employee/hooks/useCandidateProfile";

import { ProfileHero } from "@/features/employee/components/profile-view/ProfileHero";
import { ContactStrip } from "@/features/candidate-profile/components/ContactStrip";
import {
  CompletionCard,
  InterviewsCard,
} from "@/features/candidate-profile/components/StatCards";
import { ProfileSections } from "@/features/employee/components/profile-view/ProfileSections";
import {
  CtcCards,
  NoticePeriodCard,
  PreferredLocationsCard,
  PreferencesCard,
} from "@/features/employee/components/profile-view/InfoCards";
import { parseField } from "@/features/candidate-profile/components/utils";
import { ProfileLoadingSkeleton } from "@/features/candidate-profile/components/ProfileLoadingSkeleton";
import { Button } from "@/components/ui/button";


function ErrorState({ onRetry }) {
  const { t } = useTranslation("employee");
  return (
    <div className="flex flex-col items-center gap-4 px-5 py-16 text-center text-text-muted">
      <p>{t("profile.errorLoad")}</p>
      <Button type="button" className="h-auto rounded-full bg-brand-500 px-5 py-2.5 font-semibold text-white hover:bg-brand-600" onClick={onRetry}>
        {t("profile.tryAgain")}
      </Button>
    </div>
  );
}

export function EmployeeProfile() {
  const { t } = useTranslation("employee");
  const { data: raw, isLoading, isError, refetch } = useCandidateProfile();

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-300 flex-col gap-5 lg:gap-6">
        <ProfileLoadingSkeleton infoCount={5} />
      </div>
    );
  }

  if (isError || !raw) {
    return (
      <div className="mx-auto flex w-full max-w-300 flex-col gap-5 lg:gap-6">
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  /* Normalize array-ish fields (API may send JSON strings). */
  const profile = {
    ...raw,
    education: parseField(raw.education),
    experience: parseField(raw.experience),
    projects: parseField(raw.projects),
    skills: parseField(raw.skills),
    certifications: parseField(raw.certifications),
    preferred_locations: parseField(raw.preferred_locations),
  };

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-5 lg:gap-6">
      <div className="overflow-hidden rounded-xl border border-border-soft bg-card shadow-sm">
        <ProfileHero profile={profile} />
        <ContactStrip profile={profile} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CompletionCard score={profile.profile_completion_score} />
        <InterviewsCard
          used={profile.interview_attempts_used}
          max={profile.max_interviews_allowed}
        />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="lg:min-w-0 lg:flex-1 lg:rounded-xl lg:border lg:border-border-soft lg:bg-card lg:px-6 lg:py-5 lg:shadow-sm">
          <ProfileSections profile={profile} />
        </div>
        <aside className="flex flex-col gap-4 lg:w-75 lg:flex-none" aria-label={t("profile.salaryAria")}>
          <CtcCards
            current={profile.current_ctc}
            expected={profile.expected_ctc}
          />
        </aside>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <NoticePeriodCard lastWorkingDay={profile.last_day_of_working} />
        <PreferredLocationsCard locations={profile.preferred_locations} />
        <PreferencesCard
          role={profile.role}
          industry={profile.preferred_industry}
        />
      </div>
    </div>
  );
}

export default EmployeeProfile;
