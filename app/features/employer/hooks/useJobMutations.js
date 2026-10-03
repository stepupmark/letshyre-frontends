import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "@/lib/toast";
import { deleteJob, updateJob, patchJobStatus } from "@/features/employer/services/jobs.service";
import { queryKeys } from "@/lib/queryKeys";

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("employerJobs");
  return useMutation({
    mutationFn: (jobId) => deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() });
      toast.success(t("jobDetail.toasts.deleted"));
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || t("jobDetail.toasts.deleteFailed"));
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("employerJobs");
  return useMutation({
    mutationFn: ({ jobId, payload }) => updateJob(jobId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.jobs.detail(variables.jobId),
      });
      toast.success(t("editJob.toasts.updated"));
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || t("editJob.toasts.updateFailed"));
    },
  });
};

export const usePatchJobStatus = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("employerJobs");
  return useMutation({
    mutationFn: ({ jobId, status }) => patchJobStatus(jobId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.jobs.detail(variables.jobId),
      });
      toast.success(
        t("jobDetail.toasts.statusUpdated", {
          // The API takes a capitalised status; the labels are keyed lowercase.
          status: t(
            `format.status.${String(variables.status).toLowerCase()}`,
            variables.status,
          ),
        }),
      );
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || t("jobDetail.toasts.statusUpdateFailed"),
      );
    },
  });
};
