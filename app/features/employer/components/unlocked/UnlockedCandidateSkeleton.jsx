import { Skeleton } from "@/components/ui/skeleton";


// Placeholder shaped like a candidate row, sharing the real row's layout so the two don't drift.
export const UnlockedCandidateSkeleton = () => {
  return (
    <div className="uc-row-areas grid lg:grid-cols-[minmax(190px,1.2fr)_minmax(90px,auto)_minmax(150px,1.1fr)_minmax(120px,auto)_auto_auto] items-center gap-5 px-5 py-4 transition-colors duration-200 [&+&]:border-t [&+&]:border-border [@media(hover:hover)_and_(pointer:fine)]:hover:bg-bg-subtle max-lg:items-start max-lg:gap-x-4 max-lg:gap-y-3 max-lg:rounded-lg max-lg:border max-lg:border-border max-lg:bg-card max-lg:p-4 max-lg:shadow-sm" aria-hidden="true">
      <div className="flex min-w-0 items-center gap-3 max-lg:[grid-area:identity]">
        <Skeleton className="size-12 shrink-0 rounded-md" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-3.75 w-[55%] rounded-sm" />
          <Skeleton className="h-3 w-[78%] rounded-sm" />
        </div>
      </div>

      <div className="contents max-lg:[grid-area:meta] max-lg:flex max-lg:flex-wrap max-lg:items-center max-lg:gap-x-4 max-lg:gap-y-2">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-neutral-500 [&_svg]:shrink-0 [&_svg]:text-neutral-400 [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:whitespace-nowrap">
          <Skeleton className="h-3 w-17 rounded-sm" />
        </div>
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-neutral-500 [&_svg]:shrink-0 [&_svg]:text-neutral-400 [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:whitespace-nowrap">
          <Skeleton className="h-3 w-30 rounded-sm" />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1.25 max-lg:[grid-area:comp] max-lg:flex-row max-lg:flex-wrap max-lg:items-center max-lg:gap-x-4 max-lg:gap-y-2">
        <Skeleton className="h-3.75 w-17.5 rounded-sm" />
        <Skeleton className="h-3 w-22.5 rounded-sm" />
      </div>

      <Skeleton className="size-13 shrink-0 rounded-full" />

      <div className="flex items-center gap-2 max-lg:[grid-area:actions]">
        <Skeleton className="h-8.5 w-21 rounded-md" />
        <Skeleton className="h-8.5 w-21 rounded-md" />
      </div>
    </div>
  );
};
