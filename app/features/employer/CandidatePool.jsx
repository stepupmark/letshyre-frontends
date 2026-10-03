import { useState, useEffect } from "react";
import {
  Briefcase,
  UserX,
  MousePointerClick,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation, Trans } from "react-i18next";

import {
  useOpenJobs,
  useAIMatchedCandidates,
  useUnlockCandidateProfile,
} from "@/features/employer/hooks/useCandidatePool";
import { useJobDetail } from "@/features/employer/hooks/useEmployerJobs";
import { showSuccess, showError } from "@/lib/toast";
import { queryKeys, buildCandidatePoolParams } from "@/lib/queryKeys";
import { JobSelector } from "@/features/employer/components/candidate-pool/JobSelector";
import { CandidateRow } from "@/features/employer/components/candidate-pool/CandidateRow";
import { CandidatePoolSkeleton } from "@/features/employer/components/candidate-pool/CandidatePoolSkeleton";
import { EmptyState } from "@/features/employer/components/candidate-pool/EmptyState";
import { ErrorState } from "@/features/employer/components/states/ErrorState";
import { useQueryFailure } from "@/features/employer/hooks/useQueryFailure";
import UnlockProfileModal from "@/features/employer/components/candidate-pool/UnlockProfileModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CP_FILTER =
  "h-auto rounded-full bg-transparent px-3.5 py-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:bg-transparent hover:text-text-body";
const CP_FILTER_ACTIVE =
  "bg-card text-brand-700 shadow-sm hover:bg-card hover:text-brand-700";
const FILTERS = [
  { value: "ai_matched", key: "aiMatched" },
  { value: "applied", key: "applied" },
];

export function CandidatePool() {
  const { t } = useTranslation("employerCandidates");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ================= STATE =================
  // Job selection and filter live in the URL so the page is shareable/bookmarkable.
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobId: selectedJobId, appliedOnly } =
    buildCandidatePoolParams(searchParams);
  const candidateFilter = appliedOnly ? "applied" : "ai_matched";

  const [jobPage, setJobPage] = useState(1);
  const [candidateToUnlock, setCandidateToUnlock] = useState(null);

  const jobsQuery = useOpenJobs(jobPage);
  const {
    data: jobsData,
    error: jobsErrorDetail,
  } = jobsQuery;
  const {
    failed: jobsError,
    retry: retryJobs,
    retrying: jobsRetrying,
  } = useQueryFailure(jobsQuery);
  const jobsLoading = jobsQuery.isLoading && !jobsError;

  const candidatesQuery = useAIMatchedCandidates(selectedJobId, appliedOnly);
  const {
    data: candidatesData,
    error: candidatesErrorDetail,
  } = candidatesQuery;
  const {
    failed: candidatesError,
    retry: retryCandidates,
    retrying: candidatesRetrying,
  } = useQueryFailure(candidatesQuery);
  const candidatesLoading = candidatesQuery.isLoading && !candidatesError;

  const unlockMutation = useUnlockCandidateProfile();

  const jobs = jobsData?.results || [];
  const totalJobPages = jobsData?.total_pages || 1;
  const openPositions = jobsData?.count || 0;

  const candidates = candidatesData?.matches || [];
  const totalCandidates = candidatesData?.total_candidates || 0;
  const matchedCount = candidatesData?.matched_candidates_count || 0;
  const jobFoundInList = jobs.some(
    (j) => String(j.id) === String(selectedJobId),
  );

  // The job strip only ever shows one page of jobs, and a shared link may
  // point at a job that's closed or sitting on another page. Fall back to
  // fetching it directly so the header/unlock-modal still resolve correctly.
  const needsJobDetailFallback =
    !!selectedJobId && !jobsLoading && !jobFoundInList;
  const jobDetailQuery = useJobDetail(selectedJobId, needsJobDetailFallback);
  const { data: jobDetailData, error: jobDetailErrorDetail } = jobDetailQuery;
  const {
    failed: jobDetailFailed,
    retry: retryJobDetail,
    retrying: jobDetailRetrying,
  } = useQueryFailure(jobDetailQuery);

  const selectedJob = jobFoundInList
    ? jobs.find((j) => String(j.id) === String(selectedJobId))
    : needsJobDetailFallback
      ? jobDetailData
      : null;

  const jobNotFound =
    needsJobDetailFallback && jobDetailFailed;

  // Rank by AI match score so the list reads as a shortlist.
  const rankedCandidates = [...candidates].sort((a, b) => {
    const av = a?.ai_match?.ai_matching_score ?? a?.score ?? 0;
    const bv = b?.ai_match?.ai_matching_score ?? b?.score ?? 0;
    return bv - av;
  });

  // Auto-select the first job, but only once we know there's no valid job
  // already targeted by the URL. Depends on the id, not the `jobs` array,
  // which is reallocated every render while loading and would re-run this.
  const firstJobId = jobs[0]?.id;
  useEffect(() => {
    if (firstJobId && !selectedJobId) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("jobId", String(firstJobId));
          return next;
        },
        { replace: true },
      );
    }
  }, [firstJobId, selectedJobId, setSearchParams]);

  // ================= HANDLERS =================
  const handleSelectJob = (jobId) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("jobId", String(jobId));
        next.delete("applied");
        return next;
      },
      { replace: true },
    );
  };

  const handleClearSelection = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("jobId");
        next.delete("applied");
        return next;
      },
      { replace: true },
    );
  };

  const handleFilterChange = (value) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === "applied") next.set("applied", "1");
        else next.delete("applied");
        return next;
      },
      { replace: true },
    );
  };

  const handleJobPageChange = (page) => {
    setJobPage(page);
    handleClearSelection();
  };

  const handleViewProfile = (candidateId) => {
    const candidate = candidates.find((c) => c.candidate_id === candidateId);
    if (!candidate) return;

    const modalCandidate = {
      id: candidate.candidate_id,
      name: candidate.candidate_name,
      avatar: (candidate.candidate_name || "?")
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
      profile_photo_url: candidate.profile_photo_url,
      roles: [],
    };

    modalCandidate.roles.push({
      role: candidate.ai_match?.role_applied || t("pool.row.dash"),
      score: Math.round(candidate.score || 0),
    });

    if (candidate.interview_attempts) {
      candidate.interview_attempts.forEach((attempt) => {
        if (attempt.role) {
          modalCandidate.roles.push({
            role: attempt.role,
            score: Math.round(attempt.overall_score || 0),
          });
        }
      });
    }

    setCandidateToUnlock(modalCandidate);
  };

  const handleUnlockProfile = (candidateId, selectedExtras) => {
    unlockMutation.mutate(
      { candidate: candidateId, interview: selectedExtras },
      {
        onSuccess: (data) => {
          showSuccess(data?.message || t("pool.toasts.unlockSuccess"));
          setCandidateToUnlock(null);
          queryClient.invalidateQueries({
            queryKey: queryKeys.employer.credits(),
          });
        },
        onError: (error) => {
          showError(
            error?.response?.data?.message || t("pool.toasts.unlockFailed"),
          );
        },
      },
    );
  };

  const showCandidates =
    !candidatesLoading && !candidatesError && rankedCandidates.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="m-0 text-2xl font-bold tracking-tight text-brand-700">
          {t("pool.title")}
        </h1>
        <p className="mt-1 mb-0 text-sm leading-normal text-neutral-500">
          {jobsLoading && !jobsData
            ? t("pool.subtitleLoading")
            : openPositions > 0
              ? t("pool.subtitle", { count: openPositions })
              : t("pool.subtitleEmpty")}
        </p>
      </header>

      {jobsError && (
        <ErrorState
          layout="inline"
          error={jobsErrorDetail}
          onRetry={retryJobs}
          retrying={jobsRetrying}
        />
      )}

      {!jobsError && (
        <JobSelector
          jobs={jobs}
          selectedJobId={selectedJobId}
          onSelectJob={handleSelectJob}
          isLoading={jobsLoading}
          currentPage={jobPage}
          totalPages={totalJobPages}
          onPageChange={handleJobPageChange}
        />
      )}

      {!jobsLoading && !jobsError && jobs.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title={t("pool.noJobsTitle")}
          description={t("pool.noJobsBody")}
          actionLabel={t("pool.postJob")}
          onAction={() => navigate("/employer/post-job")}
        />
      )}

      {jobNotFound && (
        <ErrorState
          error={jobDetailErrorDetail}
          onRetry={retryJobDetail}
          retrying={jobDetailRetrying}
          notFound={{
            title: t("pool.jobNotFoundTitle"),
            description: t("pool.jobNotFoundBody"),
          }}
          action={{ label: t("pool.clearSelection"), onClick: handleClearSelection }}
        />
      )}

      {selectedJobId && !jobNotFound && (
        <section className="flex flex-col gap-4">
          <div className="mb-1 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="m-0 text-lg font-bold tracking-tight text-text-body">
                {t("pool.matchedTitle")}
              </h2>
              {!candidatesLoading && !candidatesError && (
                <p className="mt-0.75 mb-0 text-sm text-neutral-500">
                  <Trans
                    t={t}
                    i18nKey="pool.matchedSummary"
                    values={{ matched: matchedCount, total: totalCandidates }}
                    components={{
                      b: (
                        <span className="font-bold tabular-nums text-text-body" />
                      ),
                    }}
                  />
                  {selectedJob
                    ? t("pool.forJob", { title: selectedJob.title })
                    : ""}
                </p>
              )}
            </div>

            <div
              className="inline-flex gap-0.5 rounded-full border border-border bg-bg-subtle p-0.75"
              role="tablist"
              aria-label={t("pool.filterAria")}
            >
              {FILTERS.map(({ value, key }) => (
                <Button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={candidateFilter === value}
                  className={cn(
                    CP_FILTER,
                    candidateFilter === value && CP_FILTER_ACTIVE,
                  )}
                  onClick={() => handleFilterChange(value)}
                >
                  {t(`pool.filters.${key}`)}
                </Button>
              ))}
            </div>
          </div>

          {/* Loading — AI scan */}
          {candidatesLoading && (
            <CandidatePoolSkeleton
              variant="candidates"
              jobTitle={selectedJob?.title}
            />
          )}

          {candidatesError && !candidatesLoading && (
            <ErrorState
              error={candidatesErrorDetail}
              onRetry={retryCandidates}
              retrying={candidatesRetrying}
            />
          )}

          {/* Empty */}
          {!candidatesLoading &&
            !candidatesError &&
            rankedCandidates.length === 0 && (
              <EmptyState
                icon={UserX}
                title={t("pool.noMatchesTitle")}
                description={t("pool.noMatchesBody")}
              />
            )}

          {/* Ranked rows */}
          {showCandidates && (
            <>
              <div
                className="grid lg:grid-cols-[minmax(220px,1fr)_84px_84px_84px_84px_84px_100px] items-center gap-5 rounded-md border border-brand-200 bg-brand-100 px-5 py-3 text-xs font-bold tracking-widest uppercase text-brand-700 max-lg:hidden"
                aria-hidden="true"
              >
                <span className="flex min-w-0 items-start gap-3 max-lg:[grid-area:identity]">
                  {t("pool.columns.candidate")}
                </span>
                <span
                  className={cn(
                    "flex justify-center max-lg:[grid-area:ai] max-lg:justify-self-end",
                    "text-center",
                  )}
                >
                  {t("pool.columns.aiMatch")}
                </span>
                <span className="text-center">
                  {t("pool.columns.roleMatch")}
                </span>
                <span className="text-center">
                  {t("pool.columns.skillsMatch")}
                </span>
                <span className="text-center">
                  {t("pool.columns.interviews")}
                </span>
                <span className="text-center">
                  {t("pool.columns.experience")}
                </span>
                <span className="flex justify-end max-lg:[grid-area:action]" />
              </div>

              <div
                className={cn(
                  "overflow-hidden rounded-lg border border-border bg-card shadow-sm max-lg:flex max-lg:flex-col max-lg:gap-4 max-lg:overflow-visible max-lg:rounded-none max-lg:border-0 max-lg:bg-transparent max-lg:shadow-none",
                  "stagger-in [--stagger-step:50ms] [--stagger-max:240ms]",
                )}
              >
                {rankedCandidates.map((candidate, index) => (
                  <CandidateRow
                    key={`${candidate.candidate_id}-${index}`}
                    candidate={candidate}
                    rank={index + 1}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {!selectedJobId && !jobsLoading && !jobsError && jobs.length > 0 && (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-brand-200 bg-card px-6 py-14 text-center">
          <div className="mb-4 flex size-18 items-center justify-center rounded-full bg-brand-100 text-brand-500">
            <MousePointerClick size={40} aria-hidden="true" />
          </div>
          <h3 className="mt-0 mb-2 text-lg font-semibold text-text-body">
            {t("pool.selectJobTitle")}
          </h3>
          <p className="m-0 max-w-[44ch] text-sm leading-relaxed text-neutral-500">
            {t("pool.selectJobBody")}
          </p>
        </div>
      )}

      {candidateToUnlock && (
        <UnlockProfileModal
          candidate={candidateToUnlock}
          onClose={() => setCandidateToUnlock(null)}
          onUnlock={handleUnlockProfile}
          isUnlocking={unlockMutation.isPending}
        />
      )}
    </div>
  );
}
