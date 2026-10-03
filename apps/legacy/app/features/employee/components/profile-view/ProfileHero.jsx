import { BadgeCheck, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import { avatarFallback } from "@/features/candidate-profile/components/utils";

// Hero: gradient banner, overlapping avatar with a camera badge, verified pill,
// name and role. Card chrome comes from the wrapper in EmployeeProfile.
export function ProfileHero({ profile }) {
  const { t } = useTranslation("employee");
  const photo = profile.profile_photo || avatarFallback(profile.name);

  return (
    <div>
      <div className="h-30 bg-linear-120 from-brand-500 to-brand-400 lg:h-37.5" aria-hidden="true" />

      <div className="-mt-13.75 flex flex-col items-center gap-2 px-5 pb-5 text-center lg:mt-0 lg:flex-row lg:items-end lg:gap-5 lg:px-8 lg:pb-6 lg:text-start">
        <div className="relative size-27.5 shrink-0 lg:-mt-16.5 lg:size-33">
          <img
            src={photo}
            alt={profile.name || t("profile.photoAlt")}
            className="size-full rounded-full border-4 border-bg-card bg-brand-100 object-cover shadow-md"
            onError={(e) => {
              e.currentTarget.src = avatarFallback(profile.name);
            }}
          loading="lazy" decoding="async" />
          <span className="absolute end-0.5 bottom-1.5 grid size-7.5 place-items-center rounded-full border-2 border-bg-card bg-brand-500 text-text-white" aria-hidden="true">
            <Camera size={15} strokeWidth={2.2} />
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 lg:mb-2 lg:flex-1 lg:items-start">
          {profile.is_verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-semibold text-success">
              <BadgeCheck size={14} strokeWidth={2.4} aria-hidden="true" />
              {t("profile.verified")}
            </span>
          )}
          <h1 className="m-0 text-2xl font-bold text-text-main">{profile.name || t("profile.dash")}</h1>
          {(profile.role || profile.preferred_industry) && (
            <p className="m-0 text-sm text-text-muted">
              {profile.role || profile.preferred_industry}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileHero;
