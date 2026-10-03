import { Calendar, Cpu } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Keeps min-h-55 so the list doesn't reflow when the real cards land.
export function ScoreCardsSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex min-h-55 flex-col rounded-lg border border-brand-100 bg-card p-6 shadow-sm"
        >
          <div className="mb-5 flex items-start justify-between">
            <div className="w-[70%]">
              <Skeleton className="mb-1.5 h-5 w-3/5" />
              <div className="flex items-center gap-1">
                <Calendar
                  size={12}
                  strokeWidth={2}
                  className="text-neutral-300"
                />
                <Skeleton className="h-3.5 w-[35%]" />
              </div>
            </div>
            <Skeleton className="h-7.5 w-20 rounded-full" />
          </div>

          <div className="mb-8 flex gap-2">
            <Skeleton className="h-6.5 w-[70px]" />
            <Skeleton className="h-6.5 w-[90px]" />
            <Skeleton className="h-6.5 w-[60px]" />
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-brand-100 pt-5">
            <div className="flex items-center gap-1.5">
              <Cpu size={14} strokeWidth={2} className="text-neutral-300" />
              <Skeleton className="h-3.5 w-20" />
            </div>
            <Skeleton className="h-9 w-[110px] rounded-lg" />
          </div>
        </div>
      ))}
    </>
  );
}
