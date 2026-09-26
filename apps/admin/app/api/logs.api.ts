import { http } from "~/lib/api/http-client";
import { toApiError } from "~/lib/api/api-error";

export type OtpStatus = "Sent" | "Failed" | "Pending";

export interface PaginatedResponse<T> {
  status: boolean;
  message: string;
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface EmailLog {
  id: string;
  email: string;
  otp_type: string;
  otp_status: OtpStatus;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type EmailLogsResponse = PaginatedResponse<EmailLog>;

export const fetchEmailLogs = async (
  page: number = 1,
): Promise<EmailLogsResponse> => {
  try {
    const res = await http.get<EmailLogsResponse>(
      "commonapp/v1/admin/logs/email/",
      { params: { page } },
    );
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export interface SmsLog {
  id: string;
  phone_number: string;
  otp_status: OtpStatus;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type SmsLogsResponse = PaginatedResponse<SmsLog>;

export const fetchSmsLogs = async (
  page: number = 1,
): Promise<SmsLogsResponse> => {
  try {
    const res = await http.get<SmsLogsResponse>(
      "commonapp/v1/admin/logs/sms/",
      { params: { page } },
    );
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
};
