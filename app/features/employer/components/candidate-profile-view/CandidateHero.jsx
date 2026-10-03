import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { avatarFallback } from "@/features/candidate-profile/components/utils";
import { Button } from "@/components/ui/button";


/**
 * Candidate hero for the employer view: gradient banner, overlapping avatar,
 * verified pill, name + role. Mirrors the employee ProfileHero design but
 * swaps the self-edit affordances (edit button / camera badge) for a
 * "Go Back" control, since the employer is viewing — not editing — a profile.
 */
export function CandidateHero({ profile }) {
  const { t } = useTranslation("employerCandidates");
  const navigate = useNavigate();
  const photo = profile.profile_photo || avatarFallback(profile.name);

  // `.ep-hero` was never declared in employee-profile.css. The Go Back button
  // below is absolutely positioned against the hero CARD, which carries
  // `relative` in the parent.
  return (
    <div>
      <Button
        type="button"
        className="absolute top-4 start-4 z-2 h-auto gap-1.5 rounded-full bg-neutral-900/45 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-x-0.5 hover:bg-neutral-900/60 motion-reduce:hover:translate-x-0"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" className="rtl:-scale-x-100" />
        {t("candidateProfile.goBack")}
      </Button>

      <div className="h-30 bg-linear-120 from-brand-500 to-brand-400 lg:h-37.5" aria-hidden="true" />

      <div className="-mt-13.75 flex flex-col items-center gap-2 px-5 pb-5 text-center lg:mt-0 lg:flex-row lg:items-end lg:gap-5 lg:px-8 lg:pb-6 lg:text-start">
        <div className="relative size-27.5 shrink-0 lg:-mt-16.5 lg:size-33">
          <img
            src={photo}
            alt={profile.name || t("candidateProfile.photoAlt")}
            className="size-full rounded-full border-4 border-bg-card bg-brand-100 object-cover shadow-md"
            onError={(e) => {
              e.currentTarget.src = avatarFallback(profile.name);
            }}
          loading="lazy" decoding="async" />
        </div>

        <div className="flex flex-col items-center gap-1 lg:mb-2 lg:flex-1 lg:items-start">
          {profile.is_verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-semibold text-success">
              <BadgeCheck size={14} strokeWidth={2.4} aria-hidden="true" />
              {t("candidateProfile.verified")}
            </span>
          )}
          <h1 className="m-0 text-2xl font-bold text-text-main">{profile.name || t("candidateProfile.na")}</h1>
          {(profile.present_or_last_working_company ||
            profile.preferred_industry) && (
            <p className="m-0 text-sm text-text-muted">
              {profile.present_or_last_working_company ||
                profile.preferred_industry}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateHero;
