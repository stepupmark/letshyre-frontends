import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Mirrors the loaded job card's layout so the placeholder occupies the same space.
export const LoadingSkeleton = () => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(450px,1fr))] gap-5 py-0.5 max-md:px-1.25">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className={cn(
          "group flex cursor-pointer gap-4 rounded-lg border border-border bg-card px-6 py-5 shadow-sm transition-[transform,box-shadow,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 active:translate-y-px active:scale-99 motion-reduce:active:translate-y-0 motion-reduce:active:scale-100 [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.75 [@media(hover:hover)_and_(pointer:fine)]:hover:border-brand-300 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-lg max-md:p-4",
          // Not interactive: no pointer, no hover lift, no press feedback.
          "cursor-default hover:translate-y-0 hover:border-border hover:shadow-sm active:translate-y-0 active:scale-100",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="w-full min-w-0">
              <Skeleton className="mb-2 h-5 w-2/5 rounded-sm" />
              <Skeleton className="h-3 w-[22%] rounded-sm" />
            </div>
            <Skeleton className="h-6 w-17 shrink-0 rounded-full" />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm leading-normal text-text-muted max-md:gap-x-3 max-md:gap-y-1 max-md:text-xs">
            {[...Array(4)].map((_, j) => (
              <span key={j} className="inline-flex items-center">
                <Skeleton className="h-3 w-22.5 rounded-sm" />
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex min-w-0 flex-wrap gap-2">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-6.5 w-16 rounded-md" />
              ))}
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-brand-500 transition-[gap] duration-200 group-hover:gap-2.5">
              <Skeleton className="h-3.5 w-20 rounded-sm" />
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);
