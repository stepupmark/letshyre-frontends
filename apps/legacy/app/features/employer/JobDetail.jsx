import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Users,
  Pencil,
  Trash2,
  FileText,
  ListChecks,
  Star,
  Info,
  Briefcase,
  Banknote,
  MapPin,
  Clock,
  Building,
  CalendarClock,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useJobDetail } from "@/features/employer/hooks/useEmployerJobs";
import { useDeleteJob, usePatchJobStatus } from "@/features/employer/hooks/useJobMutations";
import { EditJobModal } from "@/features/employer/components/view-jobs/EditJobModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/features/employer/components/states/ErrorState";
import { LoadingRegion } from "@/features/employer/components/states/LoadingRegion";
import { useQueryFailure } from "@/features/employer/hooks/useQueryFailure";
import { FormSelect } from "@/components/common/FormSelect";
import { useDialogA11y } from "@/hooks/useDialogA11y";

import { cn } from "@/lib/utils";
import { useAppLocale } from "@/i18n/appLocale";

// Tone by job status.
const JD_STATUS_SELECT_TONE = {
  open: "bg-success-bg text-success",
  paused: "bg-bg-subtle text-neutral-500",
  closed: "bg-danger-bg text-danger",
};
import {
  formatDate,
  formatSalary,
  formatExperience,
  formatEmployment,
  formatWorkMode,
  formatLocation,
  getStatusMeta,
} from "@/features/employer/components/view-jobs/jobFormat";

const JobDetailSkeleton = () => (
  <div className="max-w-320">
    <Skeleton className="mb-5 h-8.5 w-30 rounded-full" />
    <div className="mb-4 flex items-start justify-between gap-5 rounded-lg border border-border bg-card p-5 shadow-sm max-md:flex-col">
      <div className="min-w-0">
        <Skeleton className="mb-2.5 h-6.5 w-65 rounded-sm" />
        <Skeleton className="h-3.5 w-35 rounded-sm" />
      </div>
      <Skeleton className="h-9 w-80 rounded-full" />
    </div>
    <div className="grid grid-cols-[2fr_1fr] items-start gap-5 max-lg:grid-cols-1">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm max-md:p-4">
        <Skeleton className="mb-4 h-5 w-2/5 rounded-sm" />
        <Skeleton className="mb-2.5 h-3 w-full rounded-sm" />
        <Skeleton className="mb-2.5 h-3 w-full rounded-sm" />
        <Skeleton className="mb-2.5 h-3 w-[70%] rounded-sm" />
      </div>
      <div className="sticky top-5 rounded-lg border border-border bg-card p-5 shadow-sm max-lg:static max-md:p-4">
        <Skeleton className="mb-4 h-5 w-2/5 rounded-sm" />
        <Skeleton className="mb-3 h-11 w-full rounded-sm" />
        <Skeleton className="mb-3 h-11 w-full rounded-sm" />
        <Skeleton className="mb-3 h-11 w-full rounded-sm" />
      </div>
    </div>
  </div>
);

export function JobDetail() {
  const { t } = useTranslation("employerJobs");
  const { locale } = useAppLocale();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const jobQuery = useJobDetail(jobId);
  const { data: job, isLoading, error } = jobQuery;
  const { failed, retry, retrying } = useQueryFailure(jobQuery);
  const deleteMutation = useDeleteJob();
  const statusMutation = usePatchJobStatus();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  /* A destructive confirm is the worst place to lose a keyboard user, and
     this one is hand-rolled rather than a Radix Dialog like EditJobModal. */
  const deleteModalRef = useDialogA11y(isDeleteModalOpen, () =>
    setIsDeleteModalOpen(false),
  );

  if (isLoading && !failed) {
    return (
      <LoadingRegion>
        <JobDetailSkeleton />
      </LoadingRegion>
    );
  }

  if (!job) {
    return (
      <div className="max-w-320">
        <Button
          className="mb-5 h-auto gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-text-muted shadow-sm transition-all hover:-translate-x-0.5 hover:bg-bg-subtle hover:text-text-main motion-reduce:hover:translate-x-0"
          onClick={() => navigate("/employer/view-jobs")}
        >
          <ArrowLeft size={16} className="rtl:-scale-x-100" /> {t("jobDetail.backToJobs")}
        </Button>
        <ErrorState
          error={failed ? error : { response: { status: 404 } }}
          onRetry={retry}
          retrying={retrying}
          headingLevel={1}
          notFound={{ title: t("jobDetail.notFoundTitle") }}
        />
      </div>
    );
  }

  const handleStatusValueChange = (newStatus) => {
    const formattedStatus =
      newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    statusMutation.mutate({ jobId: job.id, status: formattedStatus });
  };

  const confirmDelete = () => {
    deleteMutation.mutate(job.id, {
      onSuccess: () => navigate("/employer/view-jobs"),
    });
  };

  const status = getStatusMeta(job, t);
  const currentStatus = (job.status || "open").toLowerCase();

  const overview = [
    { icon: Briefcase, label: t("jobDetail.overview.experience"), value: formatExperience(job, t) },
    { icon: Banknote, label: t("jobDetail.overview.salary"), value: formatSalary(job, t) },
    { icon: MapPin, label: t("jobDetail.overview.location"), value: formatLocation(job, t) },
    { icon: Clock, label: t("jobDetail.overview.workMode"), value: formatWorkMode(job.work_mode, t) },
    {
      icon: Building,
      label: t("jobDetail.overview.employment"),
      value: formatEmployment(job.employment_type, t),
    },
    { icon: Building, label: t("jobDetail.overview.industry"), value: job.industry_type },
    { icon: GraduationCap, label: t("jobDetail.overview.education"), value: job.minimum_education },
    {
      icon: Users,
      label: t("jobDetail.overview.openings"),
      value: job.number_of_openings > 0 ? String(job.number_of_openings) : null,
    },
    {
      icon: CalendarClock,
      label: t("jobDetail.overview.applyBy"),
      value: formatDate(job.application_deadline || job.deadline, locale),
    },
  ].filter((item) => item.value);

  return (
    <div className="max-w-320">
      <Button
        className="mb-5 h-auto gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-text-muted shadow-sm transition-all hover:-translate-x-0.5 hover:bg-bg-subtle hover:text-text-main motion-reduce:hover:translate-x-0"
        onClick={() => navigate("/employer/view-jobs")}
      >
        <ArrowLeft size={16} className="rtl:-scale-x-100" /> {t("jobDetail.backToJobs")}
      </Button>

      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-5 rounded-lg border border-border bg-card p-5 shadow-sm max-md:flex-col">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-xl font-bold tracking-[-0.3px] text-brand-700">{job.title}</h1>
            {status && (
              <Badge variant="outline" className={cn("rounded-full border-transparent px-3 py-1 text-xs font-semibold tracking-wide", status.tone)}>
                {status.label}
              </Badge>
            )}
            {job.ai_generated_jd && (
              <Badge className="gap-1 rounded-full border-transparent bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
                <Sparkles size={13} aria-hidden="true" /> {t("jobDetail.aiJd")}
              </Badge>
            )}
          </div>
          <p className="mt-2 mb-0 text-sm tabular-nums text-neutral-500">
            {t("jobDetail.posted", { when: formatDate(job.job_posted_date, locale) || t("jobDetail.recently") })}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 max-md:w-full">
          <Button
            className={cn("h-auto gap-1.5 rounded-full border border-transparent px-4 py-2 text-sm font-semibold transition-all active:scale-97 motion-reduce:active:scale-100", "border-brand-600 bg-brand-600 text-white hover:border-brand-700 hover:bg-brand-700", "flex-1")}
            onClick={() => navigate(`/employer/view-jobs/applicants/${jobId}`)}
          >
            <Users size={16} /> {t("jobDetail.viewApplicants")}
          </Button>
          <Button
            className={cn("h-auto gap-1.5 rounded-full border border-transparent px-4 py-2 text-sm font-semibold transition-all active:scale-97 motion-reduce:active:scale-100", "border-border bg-card text-text-body hover:bg-bg-subtle", "flex-1")}
            onClick={() => setIsEditModalOpen(true)}
          >
            <Pencil size={16} /> {t("jobDetail.edit")}
          </Button>
          <Button
            className={cn("h-auto gap-1.5 rounded-full border border-transparent px-4 py-2 text-sm font-semibold transition-all active:scale-97 motion-reduce:active:scale-100", "border-danger-bg bg-danger-bg text-danger hover:bg-danger-bg hover:brightness-97", "flex-1")}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 size={16} /> {t("jobDetail.delete")}
          </Button>
          <FormSelect
            className={cn(
              "h-9 flex-1 gap-1.5 rounded-full border-transparent px-4 text-sm font-semibold transition-all active:scale-97 motion-reduce:active:scale-100",
              JD_STATUS_SELECT_TONE[currentStatus] ?? JD_STATUS_SELECT_TONE.open,
            )}
            value={currentStatus}
            onValueChange={handleStatusValueChange}
            disabled={statusMutation.isPending}
            aria-label={t("jobDetail.changeStatusAria")}
            options={[
              { value: "open", label: t("jobDetail.status.open") },
              { value: "paused", label: t("jobDetail.status.paused") },
              { value: "closed", label: t("jobDetail.status.closed") },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-[2fr_1fr] items-start gap-5 max-lg:grid-cols-1">
        {/* Main */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm max-md:p-4">
          <section className="mb-6 last:mb-0 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-[320ms] ease-[cubic-bezier(0.23,1,0.32,1)] [&:nth-child(2)]:[animation-delay:60ms] [&:nth-child(3)]:[animation-delay:120ms] motion-reduce:animate-none">
            <h3 className="m-0 mb-4 flex items-center gap-2 border-b border-border pb-2 text-lg font-semibold text-brand-700 [&_svg]:text-brand-500">
              <FileText size={18} /> {t("jobDetail.sections.description")}
            </h3>
            <p className="m-0 text-base leading-[1.7] whitespace-pre-wrap text-text-muted">
              {job.description || t("jobDetail.noDescription")}
            </p>
          </section>

          <section className="mb-6 last:mb-0 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-[320ms] ease-[cubic-bezier(0.23,1,0.32,1)] [&:nth-child(2)]:[animation-delay:60ms] [&:nth-child(3)]:[animation-delay:120ms] motion-reduce:animate-none">
            <h3 className="m-0 mb-4 flex items-center gap-2 border-b border-border pb-2 text-lg font-semibold text-brand-700 [&_svg]:text-brand-500">
              <ListChecks size={18} /> {t("jobDetail.sections.responsibilities")}
            </h3>
            {job.responsibilities && job.responsibilities.length > 0 ? (
              <ul className="m-0 list-none p-0 [&_li]:relative [&_li]:mb-3 [&_li]:ps-6.5 [&_li]:text-base [&_li]:leading-[1.55] [&_li]:text-text-muted [&_li:last-child]:mb-0 [&_li::before]:absolute [&_li::before]:top-[0.5em] [&_li::before]:start-1 [&_li::before]:size-1.5 [&_li::before]:rounded-full [&_li::before]:bg-brand-500 [&_li::before]:content-['']">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-base leading-[1.7] whitespace-pre-wrap text-text-muted">{t("jobDetail.noResponsibilities")}</p>
            )}
          </section>

          <section className="mb-6 last:mb-0 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-[320ms] ease-[cubic-bezier(0.23,1,0.32,1)] [&:nth-child(2)]:[animation-delay:60ms] [&:nth-child(3)]:[animation-delay:120ms] motion-reduce:animate-none">
            <h3 className="m-0 mb-4 flex items-center gap-2 border-b border-border pb-2 text-lg font-semibold text-brand-700 [&_svg]:text-brand-500">
              <Star size={18} /> {t("jobDetail.sections.requiredSkills")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skills_required && job.skills_required.length > 0 ? (
                job.skills_required.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="rounded-md border-border bg-neutral-100 px-3 py-1.25 text-xs font-medium text-text-muted">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="m-0 text-base leading-[1.7] whitespace-pre-wrap text-text-muted">{t("jobDetail.noSkills")}</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="sticky top-5 rounded-lg border border-border bg-card p-5 shadow-sm max-lg:static max-md:p-4">
          <h3 className={cn("m-0 mb-4 flex items-center gap-2 border-b border-border pb-2 text-lg font-semibold text-brand-700 [&_svg]:text-brand-500", "mb-5")}>
            <Info size={18} /> {t("jobDetail.overviewHeading")}
          </h3>

          {overview.map(({ icon: Icon, label, value }) => (
            <div className="mb-4 flex items-center gap-3 border-b border-border pb-4 last-of-type:mb-0 last-of-type:border-b-0 last-of-type:pb-0" key={label}>
              <div className="flex size-9.5 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand-600">
                <Icon size={16} />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="mb-0.5 text-xs font-semibold tracking-[0.4px] uppercase text-neutral-400">{label}</span>
                <span className="text-sm font-medium [overflow-wrap:anywhere] text-text-main">{value}</span>
              </div>
            </div>
          ))}

          {job.jd_file_url && (
            <div className="mt-5 border-t border-border pt-5">
              <span className="mb-0.5 text-xs font-semibold tracking-[0.4px] uppercase text-neutral-400">{t("jobDetail.attachment")}</span>
              <a
                href={job.jd_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-md bg-neutral-100 px-4 py-2 text-sm font-semibold text-text-body no-underline transition-[background-color,transform] hover:bg-border active:scale-98 motion-reduce:active:scale-100 [&_svg]:text-danger"
              >
                <FileText size={16} /> {t("jobDetail.viewOfficialJd")}
              </a>
            </div>
          )}
        </aside>
      </div>

      {isEditModalOpen && (
        <EditJobModal job={job} onClose={() => setIsEditModalOpen(false)} />
      )}

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-1000 flex items-center justify-center bg-text-main/40 backdrop-blur-[4px] animate-in fade-in duration-150 motion-reduce:animate-none"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            ref={deleteModalRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-job-title"
            tabIndex={-1}
            className="w-[90%] max-w-100 rounded-lg bg-card p-8 text-center shadow-xl animate-in fade-in zoom-in-96 duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-danger-bg text-danger">
              <Trash2 size={24} />
            </div>
            <h3 id="delete-job-title" className="mt-0 mb-2 text-text-main">{t("jobDetail.deleteModal.title")}</h3>
            <p className="mt-0 mb-6 text-sm leading-[1.6] text-neutral-500">
              {t("jobDetail.deleteModal.body")}
            </p>
            <div className="flex justify-center gap-3">
              <Button
                className={cn("h-auto rounded-full px-5.5 py-2.5 text-sm font-semibold transition-all active:scale-97 motion-reduce:active:scale-100", "bg-neutral-100 text-text-muted hover:bg-border")}
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteMutation.isPending}
              >
                {t("jobDetail.deleteModal.cancel")}
              </Button>
              <Button
                className={cn("h-auto rounded-full px-5.5 py-2.5 text-sm font-semibold transition-all active:scale-97 motion-reduce:active:scale-100", "bg-danger text-white hover:bg-danger hover:brightness-95")}
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? t("jobDetail.deleteModal.deleting") : t("jobDetail.deleteModal.confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
