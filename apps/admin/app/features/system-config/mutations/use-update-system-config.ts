import { useMutation, useQueryClient } from "@tanstack/react-query";
import { systemConfigKeys } from "../queries/system-config.queries";
import type { SystemConfigUpdate } from "../schemas/system-config.schema";
import { systemConfigService } from "../services/system-config.service";

export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SystemConfigUpdate) =>
      systemConfigService.update(payload),
    onSuccess: (config) =>
      queryClient.setQueryData(systemConfigKeys.all, config),
    meta: { successMessage: "Settings saved" },
  });
}
