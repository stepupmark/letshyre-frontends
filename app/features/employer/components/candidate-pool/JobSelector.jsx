/**
 * JobSelector — compact horizontal strip of open jobs. The job is context for
 * the candidate list below, so the cards stay small and don't dominate.
 */
import { Clock, TrendingUp, Banknote, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CandidatePoolSkeleton } from "@/features/employer/components/candidate-pool/CandidatePoolSkeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const JOB_PAGE_BUTTON_CLASS =
  "size-7 rounded-md border-border bg-card p-0 text-text-body hover:border-brand-300 hover:bg-bg-subtle active:scale-94 disabled:opacity-40 motion-reduce:active:scale-100";

const formatEmploymentType = (type) =>
  type
    ? type
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : null;

export const JobSelector = ({
  jobs,
  selectedJobId,
  onSelectJob,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const { t } = useTranslation("employerCandidates");
  const loadingFirst = isLoading && (!jobs || jobs.length === 0);

  if (!loadingFirst && (!jobs || jobs.length === 0)) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 text-sm font-semibold tracking-wide text-neutral-500">{t("pool.selector.heading")}</h2>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              className={JOB_PAGE_BUTTON_CLASS}
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label={t("pool.selector.prevPage")}
              type="button"
            >
              <ChevronLeft size={15} aria-hidden="true" className="rtl:-scale-x-100" />
            </Button>
            <span className="text-xs font-semibold tabular-nums text-neutral-500">
              {currentPage} / {totalPages}
            </span>
            <Button
              className={JOB_PAGE_BUTTON_CLASS}
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label={t("pool.selector.nextPage")}
              type="button"
            >
              <ChevronRight size={15} aria-hidden="true" className="rtl:-scale-x-100" />
            </Button>
          </div>
        )}
      </div>

      {loadingFirst ? (
        <CandidatePoolSkeleton variant="jobs" />
      ) : (
        <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-2" role="listbox" aria-label={t("pool.selector.listAria")}>
          {jobs.map((job) => {
            const isActive = selectedJobId === job.id;
            return (
              <div
                key={job.id}
                className={cn("flex w-58 flex-none cursor-pointer flex-col gap-2 rounded-lg border border-border bg-card px-4 py-3 shadow-sm transition-[border-color,box-shadow,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 active:scale-99 motion-reduce:active:scale-100 [@media(hover:hover)_and_(pointer:fine)]:hover:border-brand-300 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md", isActive && "border-brand-500 bg-brand-100 inset-ring-1 inset-ring-brand-500")}
                onClick={() => onSelectJob(job.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectJob(job.id);
                  }
                }}
                role="option"
                aria-selected={isActive}
                tabIndex={0}
              >
                <h3 className="m-0 overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap text-text-body" title={job.title}>
                  {job.title}
                </h3>

                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  {job.employment_type && (
                    <span className="inline-flex items-center gap-1 text-xs whitespace-nowrap text-neutral-500 [&_svg]:shrink-0 [&_svg]:text-neutral-400">
                      <Clock size={12} aria-hidden="true" />
                      {formatEmploymentType(job.employment_type)}
                    </span>
                  )}
                  {job.experience_required && (
                    <span className="inline-flex items-center gap-1 text-xs whitespace-nowrap text-neutral-500 [&_svg]:shrink-0 [&_svg]:text-neutral-400">
                      <TrendingUp size={12} aria-hidden="true" />
                      {job.experience_required}
                    </span>
                  )}
                  {job.salary_range && (
                    <span className="inline-flex items-center gap-1 text-xs whitespace-nowrap text-neutral-500 [&_svg]:shrink-0 [&_svg]:text-neutral-400">
                      <Banknote size={12} aria-hidden="true" />
                      {job.salary_range}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
