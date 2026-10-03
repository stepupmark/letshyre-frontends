import { MapPin, Briefcase, IndianRupee, Clock, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { safeUrl } from "@/lib/safeUrl";

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
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const getInitials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
};

const formatDaysAgo = (dateStr, t) => {
  if (!dateStr) return "";
  const diff = Math.floor((new Date() - new Date(dateStr)) / 86400000);
  if (diff === 0) return t("findJobs.card.today");
  return t("findJobs.card.daysAgo", { count: diff });
};

export default function JobCard({ job, onViewDetails }) {
  const { t } = useTranslation("employee");
  const companyName = job?.company_name || job?.employer || t("findJobs.card.company");
  const isApplied = !!job?.status;
  const logoSrc = job?.company_logo ? safeUrl(job.company_logo, "") : undefined;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onViewDetails(job);
    }
  };

  return (
    <Card
      className="cursor-pointer gap-0 rounded-xl border-[1.5px] border-border bg-card py-0 shadow-none transition-[border-color,box-shadow,transform] duration-200 ease-out hover:border-brand-200 hover:shadow-md active:scale-[0.995]"
        onClick={() => onViewDetails(job)}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={`${job?.title} at ${companyName}`}
    >
        <CardContent className="flex flex-col p-5 max-sm:p-4">
          {/* company logo · job title · applied badge */}
          <div className="flex items-start gap-3.5">
            <Avatar className="size-12 shrink-0 rounded-lg border border-neutral-100">
              <AvatarImage
                src={logoSrc}
                alt={t("findJobs.card.logoAlt", { company: companyName })}
                className="object-contain p-0.5"
              />
              <AvatarFallback className="rounded-lg bg-brand-100 text-sm font-bold text-brand-600">
                {getInitials(companyName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="m-0 text-sm font-bold leading-snug text-text-body md:text-base">
                  {job?.title || t("findJobs.card.untitled")}
                </h3>
                {isApplied && (
                  <Badge className="shrink-0 rounded-full border border-employee-accent/20 bg-employee-accent/10 px-2.5 py-0.5 text-xs font-semibold text-employee-accent capitalize">
                    {job.status}
                  </Badge>
                )}
              </div>
              <p className="m-0 mt-0.5 text-sm text-neutral-500">{companyName}</p>
            </div>
          </div>

          {/* location · experience · salary · type · industry */}
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {job?.location && (
              <Badge variant="outline" className="gap-1 rounded-md border-neutral-100 bg-bg-subtle px-2.5 py-1 text-xs font-medium text-text-muted">
                <MapPin size={11} strokeWidth={2.5} />
                {job.location}
              </Badge>
            )}
            {job?.experience_required && (
              <Badge variant="outline" className="gap-1 rounded-md border-neutral-100 bg-bg-subtle px-2.5 py-1 text-xs font-medium text-text-muted">
                <Briefcase size={11} strokeWidth={2.5} />
                {job.experience_required.replace(/\s*(?:years?|yrs?)$/i, "").trim()} {t("findJobs.card.yrs")}
              </Badge>
            )}
            {job?.salary_range && (
              <Badge variant="outline" className="gap-1 rounded-md border-neutral-100 bg-bg-subtle px-2.5 py-1 text-xs font-medium text-text-muted">
                <IndianRupee size={11} strokeWidth={2.5} />
                {job.salary_range.replace(/\s*(?:LPA|lpa)$/i, "").trim()} LPA
              </Badge>
            )}
            {job?.employment_type && (
              <Badge variant="outline" className="gap-1 rounded-md border-neutral-100 bg-bg-subtle px-2.5 py-1 text-xs font-medium text-text-muted">
                <Clock size={11} strokeWidth={2.5} />
                {employmentLabel(job.employment_type, t)}
              </Badge>
            )}
            {job?.industry_type && (
              <Badge variant="outline" className="gap-1 rounded-md border-neutral-100 bg-bg-subtle px-2.5 py-1 text-xs font-medium text-text-muted">
                <Building2 size={11} strokeWidth={2.5} />
                {job.industry_type}
              </Badge>
            )}
          </div>

          {/* skills — cap at 4, show overflow count */}
          {Array.isArray(job?.skills_required) && job.skills_required.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {job.skills_required.slice(0, 4).map((skill, i) => (
                <Badge key={i} variant="outline" className="rounded-md border-brand-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                  {skill}
                </Badge>
              ))}
              {job.skills_required.length > 4 && (
                <Badge variant="outline" className="rounded-md border-brand-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                  +{job.skills_required.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* posted date on the left, CTA on the right */}
          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3.5">
            <span className="text-xs text-neutral-400">
              {job?.created_at
                ? t("findJobs.card.posted", { when: formatDaysAgo(job.created_at, t) })
                : ""}
            </span>
            <Button
              size="sm"
              className={cn(
                "h-auto rounded-md px-4 py-1.75 text-xs font-semibold",
                isApplied
                  ? "bg-neutral-100 text-neutral-500 hover:bg-neutral-100"
                  : "bg-brand-500 text-white hover:bg-brand-600",
              )}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(job);
              }}
            >
              {isApplied ? t("findJobs.card.view") : t("findJobs.card.viewDetails")}
            </Button>
          </div>
        </CardContent>
    </Card>
  );
}
