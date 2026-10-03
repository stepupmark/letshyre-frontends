import { Skeleton } from "@/components/ui/skeleton";

// Mirrors SharedScorecardReport's layout so the loading state doesn't jump
// when the real content swaps in.
export function SharedScorecardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <Skeleton className="h-11 rounded-lg" />

      <div className="flex items-center gap-5">
        <Skeleton className="size-20 shrink-0 rounded-full sm:size-24" />
        <div className="flex flex-1 flex-col gap-2.5">
          <Skeleton className="h-7 w-52 rounded-sm" />
          <Skeleton className="h-4 w-36 rounded-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Skeleton className="h-44 rounded-lg" />
        <Skeleton className="h-44 rounded-lg" />
      </div>

      <Skeleton className="h-56 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-80 rounded-lg" />
    </div>
  );
}

export default SharedScorecardSkeleton;
