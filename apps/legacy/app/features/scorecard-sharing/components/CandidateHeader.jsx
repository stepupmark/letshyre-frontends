import { useTranslation } from "react-i18next";
import { MapPin, Briefcase, Target } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { shareAvatarFallback } from "@/features/scorecard-sharing/components/shareFormat";

export function CandidateHeader({ name, role, photo, location, experienceYears, matchedJobTitle }) {
  const { t } = useTranslation("sharedScorecard");
  const initials = (name || "?").trim().charAt(0).toUpperCase();
  const experience = Number(experienceYears);

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <Avatar className="size-24 shrink-0 self-center ring-4 ring-brand-100 ring-offset-2 ring-offset-card sm:size-28 sm:self-auto">
        <AvatarImage src={photo || shareAvatarFallback(name)} alt="" />
        <AvatarFallback className="bg-brand-100 text-2xl font-bold text-brand-700">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <h1 className="m-0 text-2xl font-bold text-text-main capitalize sm:text-3xl">
            {name || t("header.unnamed")}
          </h1>
          {role && <p className="mt-1 mb-0 text-base font-semibold text-brand-800">{role}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-text-muted">
          {location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} strokeWidth={2.2} aria-hidden="true" />
              {location}
            </span>
          )}
          {!Number.isNaN(experience) && experienceYears !== null && experienceYears !== undefined && (
            <span className="inline-flex items-center gap-1.5">
              <Briefcase size={14} strokeWidth={2.2} aria-hidden="true" />
              {experience === 0 ? t("header.fresher") : t("header.experience", { count: experience })}
            </span>
          )}
        </div>

        {matchedJobTitle && (
          <Badge className="max-w-full min-w-0 gap-1.5 rounded-full border-transparent bg-brand-600 px-3 py-1 text-xs font-semibold text-text-white">
            <Target size={12} strokeWidth={2.5} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{t("header.matchedTo", { job: matchedJobTitle })}</span>
          </Badge>
        )}
      </div>
    </div>
  );
}

export default CandidateHeader;
