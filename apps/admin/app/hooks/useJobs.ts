import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  fetchJobs,
  approveJob,
  rejectJob,
  updateJobStatus,
  deleteJob,
  bulkActionJobs,
  JobFilters,
  fetchJobById,
  JobManagementCards,
} from "../api/jobs.api";
import { toast } from "sonner";
import { getErrorMessage } from "~/lib/api/api-error";

export const useJobs = (filters: JobFilters) => {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => fetchJobs(filters),
    placeholderData: keepPreviousData,
  });
};

export function useJobDetail(id: string) {
  return useQuery({
    queryKey: ["job-detail", id],
    queryFn: () => fetchJobById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export const useApproveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => approveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job approved successfully");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error, "Failed to approve job"));
    },
  });
};

export const useRejectJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => rejectJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error, "Failed to reject job"));
    },
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      status,
    }: {
      jobId: string;
      status: "Open" | "Paused" | "Closed";
    }) => updateJobStatus(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(
        getErrorMessage(error, "Failed to update job status"),
      );
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason?: string }) =>
      deleteJob(jobId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(getErrorMessage(error, "Failed to delete job"));
    },
  });
};

export const useBulkActionJobs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      action: "approve" | "reject" | "delete";
      job_ids: string[];
      reason?: string;
    }) => bulkActionJobs(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      const actionPastTense =
        variables.action === "approve"
          ? "approved"
          : variables.action === "reject"
            ? "rejected"
            : "deleted";
      toast.success(`Jobs ${actionPastTense} successfully`);
    },
    onError: (error: Error) => {
      toast.error(
        getErrorMessage(error, "Failed to perform bulk action"),
      );
    },
  });
};

export const useJobActions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      action: "approve" | "reject" | "delete";
      job_ids: string[];
      reason?: string;
    }) => bulkActionJobs(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["job-detail", variables.job_ids[0]],
      });
      const actionPastTense =
        variables.action === "approve"
          ? "approved"
          : variables.action === "reject"
            ? "rejected"
            : "deleted";
      toast.success(`Jobs ${actionPastTense} successfully`);
    },
    onError: (error: Error) => {
      toast.error(
        getErrorMessage(error, "Failed to perform bulk action"),
      );
    },
  });
};

export const useJobManagementCards = () => {
  return useQuery({
    queryKey: ["job-management-cards"],
    queryFn: JobManagementCards,
    staleTime: 1000 * 30, // 30 sec
  });
};
