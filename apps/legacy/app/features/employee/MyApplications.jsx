import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCandidateApplications } from "@/features/employee/hooks/useCandidateApplications";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { cn } from "@/lib/utils";
import { initialsAvatar } from "@/features/employee/lib/avatar";
import { safeUrl } from "@/lib/safeUrl";
import { useFormatters } from "@/i18n/format";

const TABS = ["Applied", "Shortlisted", "Selected", "Rejected"];

export function MyApplications() {
  const { t } = useTranslation("employee");
  const { formatCurrencySymbol } = useFormatters();
  const currencySymbol = formatCurrencySymbol();
  const [activeTab, setActiveTab] = useState("Applied");
  const [selectedJob, setSelectedJob] = useState(null);
  // Translated lowercased status for the empty-state copy.
  const statusLower = t(`applications.statusLower.${activeTab.toLowerCase()}`);

  const modalRef = useDialogA11y(Boolean(selectedJob), () =>
    setSelectedJob(null),
  );
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCandidateApplications(activeTab);

  const jobs = data?.pages.flatMap((page) => page.results) || [];

  const getLogo = (job) => {
    const logo =
      job?.employer?.kyc?.company_logo ||
      job?.employer?.company_logo ||
      job?.company_logo;

    const fallback = initialsAvatar(getCompanyName(job));
    if (!logo) return fallback;
    return safeUrl(logo, fallback);
  };

  const getCompanyName = (job) => {
    return job?.employer?.company_name || job?.company_name || t("findJobs.card.company");
  };

  const formatDays = (dateStr) => {
    if (!dateStr) return "";
    const diff = Math.floor(
      (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24),
    );
    if (diff === 0) return t("applications.today");
    return t("applications.daysAgo", { count: diff });
  };

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6">
        <h3 className="mb-1.5 text-2xl text-brand-500">{t("applications.title")}</h3>
        <p className="text-sm text-text-muted">
          {t("applications.subtitle")}
        </p>
      </div>

      {/* TABS */}
      <div className="scrollbar-none mb-8 flex gap-2.5 overflow-x-auto max-md:mb-6 max-md:gap-2 max-md:pb-2">
        {TABS.map((tab) => (
          <Button
            key={tab}
            className={cn(
              "relative h-auto rounded-full bg-transparent px-5.5 py-2.5 text-sm font-semibold whitespace-nowrap text-neutral-500 transition-colors hover:bg-text-main/4 hover:text-text-body max-md:px-4.5",
              activeTab === tab && "text-brand-600 hover:text-brand-600",
            )}
            onClick={() => setActiveTab(tab)}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 z-0 rounded-full border border-border-soft bg-card shadow-[0_2px_10px_rgb(0_0_0_/_0.06)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-1">{t(`applications.tabs.${tab.toLowerCase()}`)}</span>
          </Button>
        ))}
      </div>

      {/* JOB LIST */}
      <div className="flex max-w-225 flex-col gap-5">
        {isLoading ? (
          <>
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border-soft bg-gradient-to-b from-bg-subtle/50 to-transparent px-5 py-20 text-center text-base text-text-muted">
            {t("applications.failedLoad")}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border-soft bg-gradient-to-b from-bg-subtle/50 to-transparent px-5 py-20 text-center text-base text-text-muted">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-border-soft bg-card text-neutral-500 shadow-[0_8px_24px_rgb(0_0_0_/_0.03)]">
              {activeTab === "Applied" ? (
                <Search size={32} />
              ) : (
                <FolderOpen size={32} />
              )}
            </div>
            <h4 className="mb-2 text-lg text-text-body">
              {t("applications.emptyTitle", { status: statusLower })}
            </h4>
            <p className="mb-5 max-w-80 text-center text-sm leading-[1.6] text-text-muted">
              {t("applications.emptyBody", { status: statusLower })}
            </p>
            {activeTab === "Applied" && (
              <Button
                className="h-auto rounded-md bg-brand-500 px-6 py-2.5 font-semibold text-white transition-all hover:bg-brand-500 hover:opacity-90 active:scale-96 motion-reduce:active:scale-100"
                onClick={() => navigate("/employee/find-jobs")}
              >
                {t("applications.findJobs")}
              </Button>
            )}
          </div>
        ) : (
          <>
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                className="flex cursor-pointer flex-col gap-3.5 rounded-xl border border-border-soft bg-card p-6 shadow-[0_4px_12px_rgb(0_0_0_/_0.02)] outline-none transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:border-border hover:shadow-[0_12px_32px_rgb(0_0_0_/_0.04)] focus-visible:border-brand-500 focus-visible:shadow-[0_0_0_3px_rgb(98_150_239_/_0.15)] active:scale-98 max-md:p-4"
                onClick={() => setSelectedJob(job)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedJob(job);
                  }
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* HEADER ROW: Logo + Title + Desktop Actions */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={getLogo(job)}
                    className="size-18.75 rounded-full border-[3px] border-neutral-100 bg-white object-contain p-1 max-md:size-12.5"
                    alt={t("findJobs.card.logoAlt", { company: getCompanyName(job) })}
                    onError={(e) => {
                      e.target.src = initialsAvatar(getCompanyName(job));
                    }}
                    loading="lazy"
                    decoding="async"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="mb-1 text-lg font-bold text-text-body">
                        {job.title || t("applications.na")}
                      </h3>
                    </div>
                    <p className="text-sm text-neutral-500">
                      {getCompanyName(job)}
                    </p>
                    <span className="mt-3.5 block text-xs text-neutral-400">
                      {t("applications.appliedWhen", { when: formatDays(job.created_at) })}
                    </span>
                  </div>

                  <div className="flex items-center max-md:hidden">
                    <Button
                      className="h-auto rounded-md bg-neutral-100 px-4.5 py-2 text-sm font-semibold text-neutral-700 transition-all hover:bg-border active:scale-95 motion-reduce:active:scale-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job);
                      }}
                    >
                      {t("applications.viewJob")}
                    </Button>
                  </div>
                </div>

                {/* BODY */}
                <div className="w-full min-w-0">
                  <div className="mt-3.5 flex flex-wrap gap-2.5 [&_span]:rounded-md [&_span]:border [&_span]:border-neutral-100 [&_span]:bg-bg-subtle [&_span]:px-3 [&_span]:py-1.5 [&_span]:text-xs [&_span]:font-medium [&_span]:text-text-muted">
                    <span>
                      {job.experience_required
                        ? t("applications.years", { count: job.experience_required })
                        : t("applications.na")}
                    </span>
                    <span>{currencySymbol} {job.salary_range || t("applications.notDisclosed")}</span>
                    <span>{job.location || t("applications.na")}</span>
                    <span>{job.employment_type || t("applications.fullTime")}</span>
                  </div>

                  <div className="mt-3.5 line-clamp-1 text-xs text-neutral-500">
                    {Array.isArray(job.skills_required) &&
                    job.skills_required.length > 0
                      ? job.skills_required.slice(0, 3).join(" · ") +
                        (job.skills_required.length > 3
                          ? ` · ${t("applications.more", { count: job.skills_required.length - 3 })}`
                          : "")
                      : t("applications.noSkills")}
                  </div>

                  {/* MOBILE ACTIONS */}
                  <div className="hidden max-md:mt-3.5 max-md:flex max-md:w-full">
                    <Button
                      className="h-auto rounded-md bg-neutral-100 px-4.5 py-2 text-sm font-semibold text-neutral-700 transition-all hover:bg-border active:scale-95 motion-reduce:active:scale-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job);
                      }}
                    >
                      {t("applications.viewJob")}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {hasNextPage && (
              <Button
                className="mx-auto my-7.5 block h-auto rounded-lg border-2 border-border bg-card px-6.5 py-2.5 text-sm font-semibold text-text-muted transition-all hover:border-neutral-300 hover:bg-bg-subtle"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? t("applications.loadingMore") : t("applications.loadMore")}
              </Button>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            className="fixed inset-0 z-5000 flex items-center justify-center bg-text-main/60"
            onClick={() => setSelectedJob(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={t("applications.modalAria")}
              tabIndex={-1}
              className="relative max-h-[90vh] w-[92%] max-w-175 overflow-y-auto rounded-xl bg-card p-7.5 shadow-[0_30px_80px_rgb(0_0_0_/_0.25)] max-md:p-5"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            >
              <Button
                className="absolute top-4 end-5 h-auto text-2xl"
                size="icon-xs"
                variant="outline"
                aria-label={t("applications.closeModal")}
                onClick={() => setSelectedJob(null)}
              >
                ×
              </Button>

              <div className="flex items-center gap-5 border-b border-neutral-100 pb-5 [&_img]:size-18.75 [&_img]:rounded-full [&_img]:border-[3px] [&_img]:border-bg-subtle [&_img]:bg-white [&_img]:object-contain [&_img]:p-1 max-md:[&_img]:size-12.5">
                <img
                  src={getLogo(selectedJob)}
                  alt={t("findJobs.card.logoAlt", { company: getCompanyName(selectedJob) })}
                  onError={(e) => {
                    e.target.src = initialsAvatar(getCompanyName(selectedJob));
                  }}
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <h3 className="mt-0 mb-1.5 text-xl text-text-body">
                    {selectedJob.title || t("applications.na")}
                  </h3>
                  <p className="m-0 text-sm text-neutral-500">
                    {getCompanyName(selectedJob)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5 [&_span]:rounded-md [&_span]:bg-bg-subtle [&_span]:px-3.5 [&_span]:py-2 [&_span]:text-xs [&_span]:font-medium [&_span]:text-text-muted">
                <span>
                  {selectedJob.experience_required
                    ? t("applications.years", { count: selectedJob.experience_required })
                    : t("applications.na")}
                </span>
                <span>{currencySymbol} {selectedJob.salary_range || t("applications.notDisclosed")}</span>
                <span>{selectedJob.location || t("applications.na")}</span>
                <span>{selectedJob.employment_type || t("applications.fullTime")}</span>
                <span>{selectedJob.industry_type || t("applications.na")}</span>
              </div>

              <div className="mt-6">
                <h4 className="mb-3 text-base text-text-body">
                  {t("applications.skillsRequired")}
                </h4>
                <div className="flex flex-wrap gap-2 [&_span]:rounded-sm [&_span]:bg-neutral-100 [&_span]:px-3 [&_span]:py-1.5 [&_span]:text-xs [&_span]:text-neutral-700">
                  {Array.isArray(selectedJob.skills_required) &&
                  selectedJob.skills_required.length > 0 ? (
                    selectedJob.skills_required.map((s, i) => (
                      <span key={i}>{s}</span>
                    ))
                  ) : (
                    <span>{t("applications.noSkills")}</span>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="mb-3 text-base text-text-body">
                  {t("applications.jobDescription")}
                </h4>
                <p className="text-sm leading-[1.7] text-text-muted">
                  {selectedJob.description || t("applications.noDescription")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
