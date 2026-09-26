import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  fetchCandidates,
  fetchCandidateProfile,
  candidatesCards,
  updateCandidateApproval,
  type CandidateApprovalPayload,
  type CandidateProfileData,
} from "../api/candidates.api";
import { toast } from "sonner";

export const useCandidates = (
  page: number,
  search?: string,
  gender?: string,
  industry?: string,
  kyc?: string,
  complete?: string,
) => {
  return useQuery({
    queryKey: ["candidates", { page, search, gender, industry, kyc, complete }],
    queryFn: () =>
      fetchCandidates(page, search, gender, industry, kyc, complete),
  });
};

export const useCandidateProfile = (id: string) => {
  return useQuery({
    queryKey: ["candidate_profile", id],
    queryFn: () => fetchCandidateProfile(id),
    enabled: !!id,
    // long staleTime so a refetch doesn't wipe the approval fields merged via setQueryData
    staleTime: 1000 * 60 * 10,
  });
};

export const useUpdateCandidateApproval = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CandidateApprovalPayload) =>
      updateCandidateApproval(profileId, payload),

    onSuccess: (_, variables) => {
      queryClient.setQueryData<CandidateProfileData>(["candidate_profile", profileId], (old) => {
        if (!old) return old;
        return {
          ...old,
          is_approved: variables.is_approved ?? old.is_approved,
          is_rejected: variables.is_rejected ?? old.is_rejected,
        };
      });
    },
    onError: () => {
      toast.error("Failed to update candidate approval");
    },
  });
};

export const useCandidateCards = () => {
  return useQuery({
    queryKey: ["candidate-dashboard-cards"],
    queryFn: candidatesCards,
    staleTime: 1000 * 30, // 30 sec
  });
};
