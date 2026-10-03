import React from 'react';
import { useTranslation } from "react-i18next";
import { JobCard } from '@/features/employer/components/view-jobs/JobCard';
import { cn } from '@/lib/utils';
import { FolderX } from "lucide-react";

const HO_EMPTY =
  "mx-3.75 my-5 rounded-lg border-2 border-dashed border-brand-200 bg-card px-5 py-15 text-center text-lg font-medium text-neutral-500";

export const JobList = ({ jobs, onView }) => {
  const { t } = useTranslation("employerJobs");
  if (!jobs || jobs.length === 0) {
    return (
      <div className={HO_EMPTY}>
        <FolderX size={40} className="mx-auto mb-3.75 block text-neutral-400" />
        {t("viewJobs.emptyFilters")}
      </div>
    );
  }
  return (
    // stagger-in supplies the entrance animation; the skeleton list omits it deliberately.
    <div className={cn("grid grid-cols-[repeat(auto-fill,minmax(450px,1fr))] gap-5 py-0.5 max-md:px-1.25", "stagger-in")}>
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onView={onView}
        />
      ))}
    </div>
  );
};
