import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";
import { Panel } from "@/components/common/Panel";

// Layout classes are duplicated from EmployeeProfile / ProfileHero, not shared —
// keep them in step by hand or the placeholder stops lining up with the real thing.
export function ProfileLoadingSkeleton({ infoCount = 3 }) {
  return (
    <>
      {/* hero */}
      <div className="overflow-hidden rounded-xl border border-border-soft bg-card shadow-sm">
        <div>
          {/* Back button placeholder — only the employer-side candidate view (infoCount 5) shows it. */}
          {infoCount === 5 && (
            <div className="pointer-events-none absolute top-4 start-4 z-2 inline-flex items-center gap-1.5 rounded-full border border-border-soft px-3.5 py-2">
              <Skeleton className="h-3.5 w-15 rounded-sm" />
            </div>
          )}
          <Skeleton className="h-30 w-full rounded-none lg:h-37.5" />
          <div className="-mt-13.75 flex flex-col items-center gap-2 px-5 pb-5 text-center lg:mt-0 lg:flex-row lg:items-end lg:gap-5 lg:px-8 lg:pb-6 lg:text-start">
            <div className="relative size-27.5 shrink-0 lg:-mt-16.5 lg:size-33">
              <Skeleton className="size-full rounded-full" />
            </div>
            <div className={cn("flex flex-col items-center gap-1 lg:mb-2 lg:flex-1 lg:items-start", "w-full")}>
              <div className="mb-2 flex items-center gap-1.5">
                <Skeleton className="h-4 w-17.5 rounded-md" />
              </div>
              <Skeleton className="mb-1 h-8 w-55 rounded-sm" />
              <Skeleton className="h-5 w-37.5 rounded-sm" />
            </div>
          </div>
        </div>
        <ul className="m-0 flex list-none flex-col px-4 pb-2 lg:flex-row lg:border-t lg:border-border-soft lg:px-8 lg:py-5">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className={cn("flex items-center gap-3 border-t border-border-soft px-1 py-3 lg:flex-1 lg:items-start lg:border-t-0 lg:px-5 lg:py-0", "lg:[&+&]:border-s lg:[&+&]:border-border-soft")}>
              <span
                className={cn("grid size-9.5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600", "bg-transparent")}
                aria-hidden="true"
              >
                <Skeleton className="size-4.5 rounded-full" />
              </span>
              <span className={cn("flex min-w-0 flex-1 flex-col", "gap-1")}>
                <Skeleton className="h-3 w-10 rounded-sm" />
                <Skeleton className="h-3.5 w-22.5 rounded-sm" />
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* stat row */}
      <div className="grid grid-cols-2 gap-4">
        <Panel className="flex flex-col items-center text-center">
          <h2 className="mt-0 mb-4 text-base font-bold text-text-main">
            <Skeleton className="h-4 w-35 rounded-sm" />
          </h2>
          <div className={cn("flex flex-col items-center gap-3", "justify-center")}>
            <Skeleton className="size-27.5 rounded-full" />
          </div>
        </Panel>
        <Panel className="flex flex-col items-center text-center">
          <h2 className="mt-0 mb-4 text-base font-bold text-text-main">
            <Skeleton className="h-4 w-35 rounded-sm" />
          </h2>
          <div className={cn("flex flex-col items-center gap-3", "min-h-30 justify-center")}>
            <Skeleton className="h-12 w-12.5 rounded-sm" />
            <Skeleton className="h-3 w-30 rounded-sm" />
          </div>
        </Panel>
      </div>

      {/* body */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="lg:min-w-0 lg:flex-1 lg:rounded-xl lg:border lg:border-border-soft lg:bg-card lg:px-6 lg:py-5 lg:shadow-sm">
          <div>
            <div className="flex gap-1 overflow-x-auto border-b border-border-soft" role="tablist">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn("inline-flex cursor-pointer items-center gap-2 border-b-2 border-transparent px-4 py-3 font-inherit text-sm font-semibold whitespace-nowrap text-text-muted transition-[color,border-color] duration-200 hover:text-text-body", "pointer-events-none")}
                >
                  <Skeleton className="h-4 w-17.5 rounded-sm" />
                </div>
              ))}
            </div>
            <div className="pt-5">
              <Panel className="flex min-h-30 flex-col gap-3">
                <Skeleton className="h-4 w-3/5 rounded-sm" />
                <Skeleton className="h-3.5 w-[90%] rounded-sm" />
                <Skeleton className="h-3.5 w-4/5 rounded-sm" />
                <Skeleton className="h-3.5 w-[70%] rounded-sm" />
              </Panel>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:w-75 lg:flex-none">
          {[0, 1].map((i) => (
            <Panel key={i} className="flex items-center gap-4">
              <span
                className={cn("grid size-11 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-600", "bg-neutral-100")}
                aria-hidden="true"
              >
                <Skeleton className="size-5 rounded-full" />
              </span>
              <span className={cn("flex flex-col", "gap-1")}>
                <Skeleton className="h-3 w-17.5 rounded-sm" />
                <Skeleton className="h-4 w-25 rounded-sm" />
              </span>
            </Panel>
          ))}
        </div>
      </div>

      {/* info grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: infoCount }).map((_, i) => (
          <Panel key={i}>
            <h2 className="mt-0 mb-4 text-base font-bold text-text-main">
              <Skeleton className="h-5 w-30 rounded-sm" />
            </h2>
            <div className="flex items-start gap-3 py-3 [&+&]:border-t [&+&]:border-border-soft">
              <span
                className={cn("grid size-9 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-600", "bg-transparent")}
                aria-hidden="true"
              >
                <Skeleton className="size-4.5 rounded-full" />
              </span>
              <span className={cn("flex flex-col", "gap-1")}>
                <Skeleton className="h-3 w-15 rounded-sm" />
                <Skeleton className="h-3.5 w-25 rounded-sm" />
              </span>
            </div>
            {i === 0 && (
              <div className="flex items-start gap-3 py-3 [&+&]:border-t [&+&]:border-border-soft">
                <span
                  className={cn("grid size-9 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-600", "bg-transparent")}
                  aria-hidden="true"
                >
                  <Skeleton className="size-4.5 rounded-full" />
                </span>
                <span className={cn("flex flex-col", "gap-1")}>
                  <Skeleton className="h-3 w-15 rounded-sm" />
                  <Skeleton className="h-3.5 w-25 rounded-sm" />
                </span>
              </div>
            )}
          </Panel>
        ))}
      </div>
    </>
  );
}

export default ProfileLoadingSkeleton;
