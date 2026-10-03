import {
  Calendar,
  Briefcase,
  Banknote,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppLocale } from "@/i18n/appLocale";

// Status colour comes from `status.tone`.
const JOB_STATUS_BADGE =
  "shrink-0 rounded-full px-3 py-1 text-xs font-semibold tracking-wide whitespace-nowrap";

const JOB_TITLE =
  "mb-1 overflow-hidden text-lg font-semibold tracking-tight text-ellipsis text-brand-600 max-md:text-base";

import {
  formatDateShort,
  formatSalary,
  formatExperience,
  formatLocation,
  formatOpenings,
  getStatusMeta,
} from "@/features/employer/components/view-jobs/jobFormat";

/**
 * Compact job card for the list. Shows only a few facts — experience,
 * salary, location, openings and the top skills — with the full detail
 * living on the dedicated job page.
 */
export const JobCard = ({ job, onView }) => {
  const { t } = useTranslation("employerJobs");
  const { locale } = useAppLocale();
  const status = getStatusMeta(job, t, { includePending: false });
  const _skills = job.skills_required || [];
  const _openings = formatOpenings(job.number_of_openings, t);

  return (
    <div
      className="group flex cursor-pointer gap-4 rounded-lg border border-border bg-card px-6 py-5 shadow-sm transition-[transform,box-shadow,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 active:translate-y-px active:scale-99 motion-reduce:active:translate-y-0 motion-reduce:active:scale-100 [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.75 [@media(hover:hover)_and_(pointer:fine)]:hover:border-brand-300 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-lg max-md:p-4"
      role="button"
      tabIndex={0}
      onClick={() => onView(job.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(job.id);
        }
      }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className={JOB_TITLE}>{job.title}</h3>
            <p className="m-0 flex items-center gap-1.5 text-sm text-neutral-400">
              <Calendar size={14} aria-hidden="true" />
              <span>
                {t("jobDetail.posted", {
                  when:
                    formatDateShort(job.job_posted_date, locale) ||
                    t("jobDetail.recently"),
                })}
              </span>
            </p>
          </div>

          {status && (
            <Badge
              variant="outline"
              className={cn(JOB_STATUS_BADGE, status.tone)}
            >
              {status.label}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm leading-normal text-text-muted max-md:gap-x-3 max-md:gap-y-1 max-md:text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Briefcase size={14} aria-hidden="true" />
            {formatExperience(job, t)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Banknote size={14} aria-hidden="true" />
            {formatSalary(job, t)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} aria-hidden="true" />
            {formatLocation(job, t)}
          </span>
          {/* {openings && (
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} aria-hidden="true" />
              {openings}
            </span>
          )} */}
        </div>

        {/* <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex min-w-0 flex-wrap gap-2">
            {skills.slice(0, 3).map((skill, i) => (
              <span key={i} className="rounded-md border border-border bg-neutral-100 px-2.5 py-1 text-xs font-medium text-text-muted transition-all duration-200">
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className={cn("rounded-md border border-border bg-neutral-100 px-2.5 py-1 text-xs font-medium text-text-muted transition-all duration-200", "text-neutral-500")}>
                +{skills.length - 3}
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-brand-500 transition-[gap] duration-200 group-hover:gap-2.5">
            {t("jobDetail.viewDetailsLink")}{" "}
            <ArrowRight
              size={14}
              aria-hidden="true"
              className="rtl:-scale-x-100"
            />
          </span>
        </div> */}
      </div>
    </div>
  );
};
