import { STALE_TIME } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { getDesktopAppReleases } from "@/features/employee/services/desktopApp.service";
import { queryKeys } from "@/lib/queryKeys";

export const useDesktopAppReleases = () => {
  return useQuery({
    queryKey: queryKeys.employee.desktopAppReleases(),
    queryFn: getDesktopAppReleases,
    staleTime: STALE_TIME.MEDIUM,
  });
};
