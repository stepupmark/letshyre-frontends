import { http } from "~/lib/api/http-client";
import { toApiError } from "~/lib/api/api-error";

export interface SystemConfig {
  id: string;
  maintenance_mode: boolean;
  max_file_upload_size_mb: number;
  api_rate_limit_per_min: number;
  celery_task_default_queue: string;
  ai_settings: Record<string, unknown>;
  default_video_retention_days: number;
  mfa_required_for_admins: boolean;
  updated_at: string;
}

export type SystemConfigPatchPayload = Partial<
  Omit<SystemConfig, "id" | "updated_at" | "ai_settings">
>;

interface SystemConfigApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: SystemConfig;
}

export const fetchSystemConfig = async (): Promise<SystemConfig> => {
  try {
    const res = await http.get<SystemConfigApiResponse>(
      "commonapp/v1/admin/settings/system-config/",
    );
    return res.data.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const patchSystemConfig = async (
  payload: SystemConfigPatchPayload,
): Promise<SystemConfig> => {
  try {
    const res = await http.patch<SystemConfigApiResponse>(
      "commonapp/v1/admin/settings/system-config/",
      payload,
    );
    return res.data.data;
  } catch (err) {
    throw toApiError(err);
  }
};
