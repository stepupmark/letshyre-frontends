import { useQuery } from "@tanstack/react-query";
import { fetchAdminInfo } from "../api/admin.api";

export const useAdminInfo = () => {
  return useQuery({
    queryKey: ["admin_info"],
    queryFn: () => fetchAdminInfo(),
  });
};
