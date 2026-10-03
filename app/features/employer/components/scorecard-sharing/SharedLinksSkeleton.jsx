import { Skeleton } from "@/components/ui/skeleton";

// Placeholder shaped like a shared-link row, sharing the real row's grid so
// loading -> loaded doesn't jump.
export const SharedLinksSkeleton = () => {
  return (
    <div className="grid grid-cols-[minmax(160px,1.3fr)_minmax(140px,1fr)_auto_auto_auto_auto] items-center gap-5 px-5 py-4 [&+&]:border-t [&+&]:border-border max-lg:grid-cols-1 max-lg:items-start max-lg:gap-2 max-lg:rounded-lg max-lg:border max-lg:border-border max-lg:bg-card max-lg:p-4 max-lg:shadow-sm" aria-hidden="true">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.75 w-[65%] rounded-sm" />
        <Skeleton className="h-3 w-[45%] rounded-sm" />
      </div>
      <Skeleton className="h-3.5 w-[70%] rounded-sm" />
      <Skeleton className="h-5.5 w-18 rounded-full" />
      <Skeleton className="h-3.5 w-12 rounded-sm" />
      <Skeleton className="h-3.5 w-16 rounded-sm" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
};
