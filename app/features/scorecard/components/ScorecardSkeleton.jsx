import { Skeleton } from "@/components/ui/skeleton";


// Shimmer skeleton mirroring the scorecard layout. Its grid/column classes are
// duplicated from the loaded scorecard, so keep the two in step by hand.
export function ScorecardSkeleton({ showInterviewVideo = false }) {
  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-5">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-23.75 rounded-full" />
        <div className="mt-1 flex flex-col gap-2">
          <Skeleton className="h-8 w-62.5 rounded-sm" />
          <Skeleton className="h-4 w-100 max-w-full rounded-sm" />
        </div>
        <Skeleton className="h-23 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[2.1fr_1fr]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.7fr_1fr]">
            <Skeleton className="min-h-55 rounded-lg" />
            <Skeleton className="min-h-55 rounded-lg" />
          </div>
          <Skeleton className="h-65 rounded-lg" />
        </div>
        <Skeleton className="min-h-75 rounded-lg" />
      </div>

      {/* Employer-only: mirrors the InterviewVideo card between the grid and Q&A. */}
      {showInterviewVideo && <Skeleton className="aspect-video w-full rounded-lg" />}

      <Skeleton className="h-90 rounded-lg" />
    </div>
  );
}

export default ScorecardSkeleton;
