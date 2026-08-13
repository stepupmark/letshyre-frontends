import { apiClient } from "./axiosInstance";
import { extractMessage } from "./apiError";

export interface ChannelSettings {
  id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  updated_at: string;
}

/** Only the three boolean toggles can be patched */
export type ChannelSettingsPatchPayload = Partial<
  Pick<ChannelSettings, "email_enabled" | "sms_enabled" | "push_enabled">
>;

interface ChannelSettingsGetResponse extends ChannelSettings {}

interface ChannelSettingsPatchResponse {
  status: boolean;
  message: string;
  data: ChannelSettings;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const fetchChannelSettings = async (): Promise<ChannelSettings> => {
  try {
    const res = await apiClient.get<ChannelSettingsGetResponse>(
      "commonapp/v1/admin/settings/channels/",
    );
    return res.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};

export const patchChannelSettings = async (
  payload: ChannelSettingsPatchPayload,
): Promise<ChannelSettings> => {
  try {
    const res = await apiClient.patch<ChannelSettingsPatchResponse>(
      "commonapp/v1/admin/settings/channels/",
      payload,
    );
    return res.data.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};
