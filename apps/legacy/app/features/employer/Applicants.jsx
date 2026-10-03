import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { useApplicants } from "@/features/employer/hooks/useApplicants";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/features/employer/components/states/ErrorState";
import { LoadingRegion } from "@/features/employer/components/states/LoadingRegion";
import { useQueryFailure } from "@/features/employer/hooks/useQueryFailure";
import { cn } from "@/lib/utils";
import { useFormatters } from "@/i18n/format";

// Tone by API status (lowercased); `applied` is the fallback for unknown values.
const APPLICANT_STATUS_TONE = {
  applied: "bg-neutral-100 text-text-muted",
  shortlisted: "bg-success-bg text-success",
  rejected: "bg-danger-bg text-danger",
  hired: "bg-brand-100 text-brand-600",
};

const ApplicantSkeleton = () => (
  <div className="pointer-events-none flex cursor-default items-center justify-between rounded-md border border-transparent bg-card px-4 py-4 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:border-border hover:bg-bg-subtle hover:shadow-[0_10px_20px_-10px_rgb(37_99_235_/_0.1)]">
    <div className="flex flex-1 items-center gap-5">
      <div className="relative">
        <Skeleton className="size-12.5 rounded-full" />
      </div>
      <div className="flex flex-col gap-1">
        <Skeleton className="mb-1 h-4 w-30 rounded-sm" />
        <Skeleton className="h-3 w-20 rounded-sm" />
      </div>
    </div>
    <div className="flex min-w-37.5 items-center justify-end">
      <Skeleton className="h-7 w-20 rounded-full" />
    </div>
  </div>
);

export function Applicants() {
  const { t } = useTranslation("employerJobs");
  const { formatDateLong } = useFormatters();
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const applicantsQuery = useApplicants(jobId, page);
  const { data, isLoading, isError, error, refetch, isFetching } = applicantsQuery;
  const { failed, retry, retrying } = useQueryFailure(applicantsQuery);

  const responseData = data?.data || {};
  const applicants = responseData.results || [];
  const totalPages = responseData.total_pages || 1;
  const count = responseData.count || 0;

  const handleNextPage = () => {
    if (page < totalPages) setPage((old) => old + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((old) => old - 1);
  };

  return (
    <div className="mx-auto max-w-300 text-text-body">
      <Button
        className="mb-4 h-auto gap-2 bg-transparent text-base font-medium text-neutral-500 transition-colors hover:bg-transparent hover:text-brand-600"
        onClick={() => navigate(`/employer/view-jobs/${jobId}`)}
      >
        <ArrowLeft size={16} className="rtl:-scale-x-100" />{" "}
        {t("applicants.backToJob")}
      </Button>

      <div className="mb-7.5 flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-3">
        <div>
          <h1 className="m-0 text-2xl font-bold tracking-tight text-brand-700 max-md:text-xl">
            {t("applicants.title")}
          </h1>
          <h4 className="mt-2 text-sm leading-normal font-normal text-neutral-500">
            {t("applicants.subtitle")}
          </h4>
        </div>
        {!isLoading && !failed && (
          <div className="text-base font-semibold text-text-main [&_span]:text-brand-600">
            {t("applicants.total")} <span>{count}</span>
          </div>
        )}
      </div>

      {isError && data && (
        <ErrorState
          layout="inline"
          stale
          error={error}
          onRetry={refetch}
          retrying={isFetching}
          className="mb-4"
        />
      )}

      {isLoading && !failed ? (
        <LoadingRegion className="gap-4 rounded-lg border border-border bg-card p-4 shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.02)]">
          {[...Array(5)].map((_, i) => (
            <ApplicantSkeleton key={i} />
          ))}
        </LoadingRegion>
      ) : failed ? (
        <ErrorState error={error} onRetry={retry} retrying={retrying} />
      ) : applicants.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-card px-5 py-20 text-center">
          <Users size={48} className="mx-auto mb-4 text-neutral-400" />
          <h3 className="mt-0 mb-2 text-xl text-text-main">
            {t("applicants.emptyTitle")}
          </h3>
          <p className="mx-auto max-w-100 text-neutral-500">
            {t("applicants.emptyBody")}
          </p>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.02)] transition-opacity duration-200",
              isFetching && "opacity-60",
            )}
          >
            {applicants.map((app) => (
              <div
                className="flex cursor-default items-center justify-between rounded-md border border-transparent bg-card px-6 py-4 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:border-border hover:bg-bg-subtle hover:shadow-[0_10px_20px_-10px_rgb(37_99_235_/_0.1)]"
                key={app.id}
              >
                <div className="flex flex-1 items-center gap-5">
                  <div className="relative">
                    {app.profile_photo ? (
                      <img
                        src={app.profile_photo}
                        alt={app.name}
                        className="size-12.5 rounded-full object-cover shadow-[0_2px_4px_rgb(0_0_0_/_0.05)]"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex size-12.5 items-center justify-center rounded-full bg-gradient-to-br from-border to-neutral-300 text-lg font-semibold text-neutral-500 shadow-[0_2px_4px_rgb(0_0_0_/_0.05)]">
                        {app.name ? app.name.charAt(0).toUpperCase() : "?"}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="m-0 text-base font-semibold text-text-main">
                      {app.name}
                    </h3>
                    <p className="m-0 text-sm text-neutral-500">
                      {t("applicants.appliedOn", {
                        date: formatDateLong(app.created_at),
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-37.5 items-center justify-end">
                  <span
                    className={cn(
                      "m-0 rounded-lg px-4 py-1.5 text-xs font-semibold tracking-[0.5px] uppercase",
                      APPLICANT_STATUS_TONE[
                        (app.status || "applied").toLowerCase()
                      ] ?? APPLICANT_STATUS_TONE.applied,
                    )}
                  >
                    {t(
                      `applicants.status.${(app.status || "applied").toLowerCase()}`,
                      {
                        defaultValue:
                          app.status || t("applicants.status.applied"),
                      },
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button
                className="h-auto rounded-sm border border-border bg-card px-4 py-2 font-medium text-text-muted transition-all hover:border-neutral-300 hover:bg-bg-subtle disabled:bg-neutral-100 disabled:opacity-50"
                onClick={handlePrevPage}
                disabled={page === 1 || isFetching}
              >
                <ChevronLeft size={14} className="rtl:-scale-x-100" />{" "}
                {t("applicants.previous")}
              </Button>
              <span className="text-sm font-medium text-neutral-500">
                {t("applicants.pageOf", { page, total: totalPages })}
              </span>
              <Button
                className="h-auto rounded-sm border border-border bg-card px-4 py-2 font-medium text-text-muted transition-all hover:border-neutral-300 hover:bg-bg-subtle disabled:bg-neutral-100 disabled:opacity-50"
                onClick={handleNextPage}
                disabled={page === totalPages || isFetching}
              >
                {t("applicants.next")}{" "}
                <ChevronRight size={14} className="rtl:-scale-x-100" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
