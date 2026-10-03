import {
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  Building2,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { initialsAvatar } from "@/features/employee/lib/avatar";
import { safeUrl } from "@/lib/safeUrl";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const EMPLOYMENT_KEYS = {
  full_time: "fullTime",
  part_time: "partTime",
  internship: "internship",
  contract: "contract",
  freelance: "freelance",
};
const employmentLabel = (type, t) => {
  if (!type) return t("findJobs.card.na");
  const key = EMPLOYMENT_KEYS[type];
  if (key) return t(`findJobs.filter.${key}`);
  return type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

// Company logo URL, or a generated initials avatar when missing/unsafe.
const getLogoUrl = (job) => {
  const logo = job?.company_logo;
  const fallback = initialsAvatar(job?.company_name || job?.employer || "C");
  if (!logo) return fallback;
  return safeUrl(logo, fallback);
};

export default function JobDetailModal({ job, onClose, onApply, isApplying }) {
  // Body dereferences `job` directly and JSX children evaluate eagerly, so guard
  // here rather than relying on Radix to unmount the content later.
  const { t } = useTranslation("employee");

  if (!job) return null;

  const companyName = job?.company_name || job?.employer || t("findJobs.card.company");
  const isApplied = !!job?.status;

  // Radix Dialog handles Escape, scroll lock, focus trap/restore and the exit
  // transition, so none of that is hand-rolled here.
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-auto max-w-none border-0 bg-transparent p-0 shadow-none sm:max-w-none"
        overlayClassName="bg-text-main/60"
        showCloseButton={false}
      >
        <div className="scrollbar-thin relative max-h-[90vh] w-full max-w-190 overflow-y-auto rounded-xl bg-card p-7 shadow-xl max-lg:rounded-lg max-lg:p-5 max-md:max-h-[85dvh] max-md:rounded-lg max-md:p-4 max-sm:max-h-[95vh] max-sm:rounded-md max-sm:p-3.5">
          {/* CLOSE BUTTON */}
          <DialogClose
            className="absolute top-4 end-4.5 flex size-8 cursor-pointer items-center justify-center rounded-md border-0 bg-neutral-100 text-lg text-neutral-500 transition-all duration-200 hover:bg-border hover:text-text-body"
            aria-label={t("findJobs.modal.close")}
          >
            <X size={20} strokeWidth={2.5} />
          </DialogClose>

          {/* HEADER */}
          <div className="flex items-center gap-4.5 border-b border-neutral-100 pb-4.5 max-lg:flex-col max-lg:items-start max-lg:gap-3">
            <img
              className="size-16 rounded-lg border-2 border-neutral-100 bg-bg-subtle object-contain max-md:size-13 max-sm:size-11 max-sm:rounded-md"
              src={getLogoUrl(job)}
              alt={t("findJobs.card.logoAlt", { company: companyName })}
              onError={(e) => {
                e.target.src = initialsAvatar(companyName);
              }}
              loading="lazy"
              decoding="async"
            />
            <div>
              <DialogTitle asChild>
                <h3 className="m-0 mb-1 text-xl font-bold text-text-body max-md:text-lg max-sm:text-base">
                  {job?.title}
                </h3>
              </DialogTitle>
              <p className="m-0 text-sm text-neutral-500">{companyName}</p>
            </div>
          </div>

          {/* META TAGS */}
          <div className="mt-4.5 flex flex-wrap gap-2.5">
            {job?.experience_required && (
              <Badge
                variant="outline"
                className="gap-1.5 rounded-md border-neutral-100 bg-bg-subtle px-3.5 py-1.75 text-xs font-medium text-text-muted"
              >
                <Briefcase size={14} strokeWidth={2} />
                {job.experience_required}
              </Badge>
            )}
            {job?.salary_range && (
              <Badge
                variant="outline"
                className="gap-1.5 rounded-md border-neutral-100 bg-bg-subtle px-3.5 py-1.75 text-xs font-medium text-text-muted"
              >
                <IndianRupee size={14} strokeWidth={2} />
                {job.salary_range}
              </Badge>
            )}
            {job?.location && (
              <Badge
                variant="outline"
                className="gap-1.5 rounded-md border-neutral-100 bg-bg-subtle px-3.5 py-1.75 text-xs font-medium text-text-muted"
              >
                <MapPin size={14} strokeWidth={2} />
                {job.location}
              </Badge>
            )}
            {job?.employment_type && (
              <Badge
                variant="outline"
                className="gap-1.5 rounded-md border-neutral-100 bg-bg-subtle px-3.5 py-1.75 text-xs font-medium text-text-muted"
              >
                <Clock size={14} strokeWidth={2} />
                {employmentLabel(job.employment_type, t)}
              </Badge>
            )}
            {job?.industry_type && (
              <Badge
                variant="outline"
                className="gap-1.5 rounded-md border-neutral-100 bg-bg-subtle px-3.5 py-1.75 text-xs font-medium text-text-muted"
              >
                <Building2 size={14} strokeWidth={2} />
                {job.industry_type}
              </Badge>
            )}
          </div>

          {/* SKILLS */}
          {Array.isArray(job?.skills_required) &&
            job.skills_required.length > 0 && (
              <div className="mt-5.5">
                <h4 className="mb-2.5 text-sm font-bold text-text-body">
                  {t("findJobs.modal.skillsRequired")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.map((skill, i) => (
                    <Badge
                      variant="outline"
                      className="rounded-sm border-brand-200 bg-brand-100 px-3.5 py-1.5 text-xs font-medium text-employee-accent max-md:px-2.5 max-md:py-1"
                      key={i}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* DESCRIPTION */}
          <div className="mt-5.5">
            <h4 className="mb-2.5 text-sm font-bold text-text-body">
              {t("findJobs.modal.jobDescription")}
            </h4>
            <p className="text-sm leading-loose whitespace-pre-line text-text-muted max-sm:text-xs">
              {job.description || t("findJobs.modal.noDescription")}
            </p>
          </div>

          {/* APPLY BUTTON */}
          <Button
            className={cn(
              "mt-6 h-auto w-full rounded-md bg-brand-500 px-6 py-3.25 text-base font-bold text-text-white transition-all hover:bg-brand-600 active:scale-98 disabled:opacity-65 motion-reduce:active:scale-100 max-md:px-5 max-md:py-3 max-md:text-sm max-sm:px-4 max-sm:py-2.75",
              isApplied && "bg-border text-neutral-500 hover:bg-border",
            )}
            disabled={isApplying || isApplied}
            onClick={() => onApply(job.id)}
          >
            {isApplying
              ? t("findJobs.modal.applying")
              : isApplied
                ? t("findJobs.modal.alreadyApplied")
                : t("findJobs.modal.applyNow")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
