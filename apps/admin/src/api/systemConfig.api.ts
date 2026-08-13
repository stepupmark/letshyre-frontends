/**
 * systemConfig.api.ts
 *
 * API layer for System Configuration.
 * Handles GET (fetch) and PATCH (partial update) operations.
 */

import { apiClient } from "./axiosInstance";
import { extractMessage } from "./apiError";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── API Functions ────────────────────────────────────────────────────────────

export const fetchSystemConfig = async (): Promise<SystemConfig> => {
  try {
    const res = await apiClient.get<SystemConfigApiResponse>(
      "commonapp/v1/admin/settings/system-config/",
    );
    return res.data.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};

export const patchSystemConfig = async (
  payload: SystemConfigPatchPayload,
): Promise<SystemConfig> => {
  try {
    const res = await apiClient.patch<SystemConfigApiResponse>(
      "commonapp/v1/admin/settings/system-config/",
      payload,
    );
    return res.data.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};
