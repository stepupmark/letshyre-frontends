import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Card geometry duplicated from DashboardTopCards, so keep the two in step by
// hand; the hover lift is cancelled since a placeholder isn't interactive.
const DashboardStatsSkeleton = () => {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className={cn("flex h-37.5 flex-col justify-between rounded-lg border border-border-soft bg-card p-5 shadow-sm 3xl:h-44 3xl:p-6 transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0", "hover:translate-y-0 hover:shadow-sm")}
        >
          <div className="text-sm font-semibold text-neutral-900">
            <Skeleton className="h-4 w-30 rounded-xs" />
          </div>
          <div className="mt-4 flex h-full items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-md 3xl:size-14" />
              <div className={cn("flex items-baseline gap-2", "flex-col items-start gap-2 ps-1")}>
                <Skeleton className="h-7 w-10 rounded-xs" />
                <Skeleton className="h-3.5 w-20 rounded-xs" />
              </div>
            </div>
            <div>
              <Skeleton className="h-10 w-17.5 rounded-xs" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default DashboardStatsSkeleton;
