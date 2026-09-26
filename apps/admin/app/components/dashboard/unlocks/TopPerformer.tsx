import { Trophy, Star } from "lucide-react";
import { UnlocksDashboardData } from "../../../api/unlocks.api";

export default function TopPerformer({
  topPerformer,
}: {
  topPerformer: UnlocksDashboardData["top_performer"];
}) {
  const employerName =
    topPerformer?.top_employer?.employer__user__name || "N/A";
  const total = topPerformer?.top_employer?.total || 0;

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-yellow-100/80 bg-[#FFFDF5] p-6 shadow-xs dark:border-yellow-900/30 dark:bg-yellow-900/10">
      <div className="absolute top-3 left-6 flex items-center gap-2">
        <Star className="h-4 w-4 fill-[#EAB308] text-[#EAB308]" />
        <h3 className="text-sm font-bold text-foreground">Top Performer</h3>
      </div>

      <div className="relative mt-8 mb-2">
        <Trophy
          className="relative z-10 h-16 w-16 text-[#FBBF24] drop-shadow-xs"
          strokeWidth={1.5}
        />
        <Star className="absolute -top-1 -left-4 h-4 w-4 animate-pulse fill-[#FDE68A] text-[#FDE68A]" />
        <Star className="absolute top-3 -right-4 h-3 w-3 animate-pulse fill-[#FCD34D] text-[#FCD34D] delay-150" />
      </div>

      <p className="mt-2 mb-1 text-center text-lg font-bold text-foreground">
        {employerName}
      </p>
      <p className="text-sm font-semibold text-muted-foreground">
        {total} Unlocks
      </p>
    </div>
  );
}
