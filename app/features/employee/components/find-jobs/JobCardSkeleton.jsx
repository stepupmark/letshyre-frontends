import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function JobCardSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="gap-0 rounded-xl border-[1.5px] border-border py-0 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-start gap-3.5">
              <Skeleton className="size-12 shrink-0 rounded-lg" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-[55%] rounded" />
                <Skeleton className="h-3.5 w-[35%] rounded" />
              </div>
            </div>
            <div className="mt-3.5 flex gap-2">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3.5">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-7 w-24 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
