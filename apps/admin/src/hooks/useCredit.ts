import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCredit, updateCredit } from "../api/credit.api";

export const useCredit = () => {
  return useQuery({
    queryKey: ["credit"],
    queryFn: getCredit,
  });
};

export const useUpdateCredit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCredit,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit"] });
    },
  });
};
