import { Skeleton } from "@/components/ui/skeleton";

// Mirrors TeamCard's shape while loading.
export function TeamSkeleton() {
  return (
    <div className="flex h-90 min-w-62.5 shrink-0 flex-col items-center rounded-lg border border-border-soft bg-card p-6">
      <Skeleton className="mt-10 mb-auto size-30 rounded-full" />
      <Skeleton className="mb-2 h-5 w-4/5 rounded-sm" />
      <Skeleton className="h-4 w-3/5 rounded-sm" />
    </div>
  );
}
