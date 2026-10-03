import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Mirrors the loaded employer profile; its layout classes are duplicated from
// that component, so keep the two in step by hand.
const SkeletonGridItem = () => (
  <div className="flex items-start gap-4">
    <Skeleton className={cn("flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600", "size-12.5 rounded-sm")} />
    <div className="flex flex-1 flex-col gap-1.5">
      <Skeleton className="h-3.5 w-2/5 rounded-sm" />
      <Skeleton className="h-4.5 w-[70%] rounded-sm" />
    </div>
  </div>
);

export const ProfileSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-8" aria-hidden="true">
      {/* Banner */}
      <section className="relative h-60 overflow-hidden rounded-md bg-gradient-to-b from-card to-brand-400 before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(ellipse_at_50%_-20%,rgba(255,255,255,0.6)_0%,transparent_65%)] before:content-[''] max-lg:h-53.75 max-md:flex max-md:h-auto max-md:flex-col max-md:items-center max-md:justify-center max-md:gap-2.5 max-md:rounded-lg max-md:px-5 max-md:pt-6 max-md:pb-5 max-sm:gap-2 max-sm:px-4 max-sm:pt-5 max-sm:pb-4">
        {/* The banner content is inset for the side images; the skeleton has
            none, so it spans the full width. */}
        {/* Mirrors ProfileBanner's center well, which stays physical to align with its two side images; kept physical here for consistency */}
        <div className={cn("absolute inset-y-0 right-45 left-55 z-2 flex flex-col items-center justify-center gap-2.5 px-5 text-center max-lg:right-35 max-lg:left-45 max-md:static max-md:inset-auto max-md:w-full max-md:p-0", "right-0 left-0")}>
          <Skeleton className="h-8 w-60 rounded-sm" />
          <Skeleton className="mt-2 mb-4 h-4 w-75 rounded-sm" />
          <Skeleton className="mb-5 h-9.5 w-30 rounded-sm" />

          <div className="flex gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={cn("flex flex-col gap-0.75 px-7 py-1 text-center whitespace-nowrap not-last:border-e-[1.5px] not-last:border-e-[rgba(26,58,110,0.25)] max-md:px-4 max-sm:px-2.5", "not-last:border-e-0")}>
                <Skeleton className="h-7 w-10 rounded-sm" />
                <Skeleton className="mt-1 h-3.5 w-15 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Primary details */}
      <section className="rounded-lg border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md max-md:p-6">
        <h3 className="relative mt-0 mb-8 inline-block text-lg font-semibold text-text-main after:absolute after:-bottom-2 after:start-0 after:h-0.75 after:w-10 after:rounded-[2px] after:bg-brand-600 after:content-['']">
          <Skeleton className="h-5.5 w-35 rounded-sm" />
        </h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
          {[0, 1, 2].map((col) => (
            <div key={col} className="flex flex-col gap-8">
              <SkeletonGridItem />
              <SkeletonGridItem />
            </div>
          ))}
        </div>
      </section>

      {/* Company details */}
      <section className="rounded-lg border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md max-md:p-6">
        <h3 className="relative mt-0 mb-8 inline-block text-lg font-semibold text-text-main after:absolute after:-bottom-2 after:start-0 after:h-0.75 after:w-10 after:rounded-[2px] after:bg-brand-600 after:content-['']">
          <Skeleton className="h-5.5 w-37.5 rounded-sm" />
        </h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
          {[0, 1, 2].map((col) => (
            <div key={col} className="flex flex-col gap-8">
              <SkeletonGridItem />
              <SkeletonGridItem />
            </div>
          ))}
          <div className="flex flex-col gap-8">
            <SkeletonGridItem />
          </div>
          <div className={cn("flex flex-col gap-8", "col-span-full")}>
            <div className={cn("flex items-start gap-4", "w-full")}>
              <Skeleton className={cn("flex min-h-12.5 min-w-12.5 items-center justify-center rounded-md bg-brand-100 p-3 text-2xl text-brand-600", "size-12.5 rounded-sm")} />
              <div className="flex w-full flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-25 rounded-sm" />
                <Skeleton className="h-4 w-full rounded-sm" />
                <Skeleton className="h-4 w-[90%] rounded-sm" />
                <Skeleton className="h-4 w-4/5 rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="rounded-lg border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md max-md:p-6">
        <h3 className="relative mt-0 mb-8 inline-block text-lg font-semibold text-text-main after:absolute after:-bottom-2 after:start-0 after:h-0.75 after:w-10 after:rounded-[2px] after:bg-brand-600 after:content-['']">
          <Skeleton className="h-5.5 w-40 rounded-sm" />
        </h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn("flex items-center gap-4 rounded-md border border-border bg-bg-subtle p-4 no-underline transition-all hover:-translate-y-0.5 hover:border-brand-600 hover:bg-card hover:shadow-sm", "bg-transparent")}>
              <Skeleton className="size-13 rounded-sm" />
              <div className={cn("flex flex-col", "flex-1 gap-1.5")}>
                <Skeleton className="h-4 w-[70%] rounded-sm" />
                <Skeleton className="h-3 w-2/5 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
