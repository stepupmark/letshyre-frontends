import { useMutation } from "@tanstack/react-query";
import { jobsKeys } from "../queries/jobs.queries";
import type { JobsAction } from "../schemas/jobs.schema";
import { jobsService } from "../services/jobs.service";

export function useJobAction() {
  return useMutation({
    mutationFn: (payload: JobsAction) => jobsService.act(payload),
    meta: { successMessage: "Jobs updated", invalidates: [jobsKeys.all] },
  });
}
