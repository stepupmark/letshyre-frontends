import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPendingKycEmployers,
  updateEmployerKycStatus,
  fetchKycDetail,
} from "../api/kyc.api";

export const usePendingKycEmployers = (
  page: number,
  status: "Pending" | "Verified" | "Rejected" = "Pending"
) => {
  return useQuery({
    queryKey: ["kyc_employers", { page, status }],
    queryFn: () => fetchPendingKycEmployers(page, status),
  });
};

export const useUpdateKycStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      kycId,
      status,
      remarks,
    }: {
      kycId: string;
      status: "Verified" | "Rejected";
      remarks?: string;
    }) => updateEmployerKycStatus(kycId, status, remarks),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kyc_employers"] });
      queryClient.invalidateQueries({ queryKey: ["kyc_detail", variables.kycId] });
    },
  });
};

export const useKycDetail = (kycId: string) => {
  return useQuery({
    queryKey: ["kyc_detail", kycId],
    queryFn: () => fetchKycDetail(kycId),
    enabled: !!kycId,
  });
};
