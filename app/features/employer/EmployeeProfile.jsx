import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { UserX } from "lucide-react";
import { useUnlockedCandidateProfile } from "@/features/employer/hooks/useUnlockedCandidateProfile";

import { ProfileLoadingSkeleton } from "@/features/candidate-profile/components/ProfileLoadingSkeleton";
import { ContactStrip } from "@/features/candidate-profile/components/ContactStrip";
import { parseField } from "@/features/candidate-profile/components/utils";

import { CandidateHero } from "@/features/employer/components/candidate-profile-view/CandidateHero";
import {
  CompletionCard,
  InterviewsCard,
} from "@/features/candidate-profile/components/StatCards";
import { CandidateSections } from "@/features/employer/components/candidate-profile-view/CandidateSections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CtcCards,
  NoticePeriodCard,
  PreferredLocationsCard,
  PreferencesCard,
  AddressCard,
  RolesAppliedCard,
} from "@/features/employer/components/candidate-profile-view/CandidateInfoCards";

import { cn } from "@/lib/utils";

function ErrorState({ onRetry }) {
  const { t } = useTranslation("employerCandidates");
  return (
    <div className="flex flex-col items-center py-16 w-full">
      <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
            <UserX size={24} />
          </div>
          <p className="text-sm font-medium text-neutral-500">{t("candidateProfile.errorBody")}</p>
          <Button type="button" onClick={onRetry} className="w-full h-10 font-semibold transition-all active:scale-97">
            {t("candidateProfile.tryAgain")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function EmployeeProfile() {
  const { t } = useTranslation("employerCandidates");
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const {
    data: raw,
    isLoading,
    isError,
    refetch,
  } = useUnlockedCandidateProfile(id);

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

  // Map the employer API response (candidate_* fields) onto the shared profile shape.
  const experience = parseField(raw.candidate_experience);
  const profile = {
    id: raw.candidate,
    name: raw.candidate_name,
    email: raw.candidate_email,
    phone_number: raw.candidate_phone,
    location: raw.candidate_location,
    address: raw.candidate_address,
    profile_photo: raw.candidate_profile_photo,
    gender: raw.candidate_gender,
    total_experience_years: raw.candidate_total_experience_years,
    education: parseField(raw.candidate_education),
    experience,
    projects: parseField(raw.candidate_projects),
    skills: parseField(raw.candidate_skills),
    certifications: parseField(raw.candidate_certifications),
    preferred_locations: parseField(raw.candidate_preferred_locations),
    preferred_industry: raw.candidate_preferred_industry,
    current_ctc: raw.candidate_current_ctc,
    expected_ctc: raw.candidate_expected_ctc,
    notice_period: raw.candidate_notice_period,
    notice_period_prof: raw.candidate_notice_period_prof,
    roles_applied: parseField(raw.candidate_roles_applied),
    resume: raw.candidate_resume,
    is_verified: raw.candidate_is_verified,
    profile_completion_score: raw.candidate_profile_completion_score,
    interview_attempts_used: parseField(raw.candidate_interview_scores).length,
    max_interviews_allowed: 3,
    present_or_last_working_company: experience[0]?.company || null,
  };

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-5 lg:gap-6">
      {/* `relative` makes this card the containing block for the absolutely-positioned "Go Back" control. */}
      <div className={cn("overflow-hidden rounded-xl border border-border-soft bg-card shadow-sm", "relative")}>
        <CandidateHero profile={profile} />
        <ContactStrip profile={profile} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CompletionCard
          score={profile.profile_completion_score}
          perspective="candidate"
        />
        <InterviewsCard
          used={profile.interview_attempts_used}
          max={profile.max_interviews_allowed}
        />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="lg:min-w-0 lg:flex-1 lg:rounded-xl lg:border lg:border-border-soft lg:bg-card lg:px-6 lg:py-5 lg:shadow-sm">
          <CandidateSections profile={profile} />
        </div>
        <aside className="flex flex-col gap-4 lg:w-75 lg:flex-none" aria-label={t("candidateProfile.salaryExpectations")}>
          <CtcCards
            current={profile.current_ctc}
            expected={profile.expected_ctc}
          />
        </aside>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <NoticePeriodCard noticePeriod={profile.notice_period} />
        <PreferredLocationsCard locations={profile.preferred_locations} />
        <PreferencesCard industry={profile.preferred_industry} />
        <RolesAppliedCard roles={profile.roles_applied} />
        <AddressCard address={profile.address} />
      </div>
    </div>
  );
}

export default EmployeeProfile;
