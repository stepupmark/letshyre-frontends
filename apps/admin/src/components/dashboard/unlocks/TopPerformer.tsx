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
    <div className="h-full bg-[#FFFDF5] dark:bg-yellow-900/10 rounded-3xl border border-yellow-100/80 dark:border-yellow-900/30 p-6 shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute flex items-center gap-2 top-3 left-6">
        <Star className="w-4 h-4 text-[#EAB308] fill-[#EAB308]" />
        <h3 className="text-sm font-bold text-gray-800 dark:text-white">
          Top Performer
        </h3>
      </div>

      <div className="relative mt-8 mb-2">
        <Trophy
          className="w-16 h-16 text-[#FBBF24] relative z-10 drop-shadow-sm"
          strokeWidth={1.5}
        />
        <Star className="w-4 h-4 text-[#FDE68A] fill-[#FDE68A] absolute -top-1 -left-4 animate-pulse" />
        <Star className="w-3 h-3 text-[#FCD34D] fill-[#FCD34D] absolute top-3 -right-4 animate-pulse delay-150" />
      </div>

      <p className="mt-2 mb-1 text-lg font-bold text-center text-gray-900 dark:text-white">
        {employerName}
      </p>
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
        {total} Unlocks
      </p>
    </div>
  );
}
