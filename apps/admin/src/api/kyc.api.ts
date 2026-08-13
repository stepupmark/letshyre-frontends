import { apiClient } from "./axiosInstance";
import { extractMessage } from "./apiError";

export interface KycRecord {
  id: string;
  employer: string;
  company_name: string;
  company_logo: string | null;
  company_website: string | null;
  company_description: string;
  company_industry: string;
  company_registration_number: string | null;
  gst_number: string | null;
  pan_number: string | null;
  company_address: string;
  website_url: string | null;
  official_email: string | null;
  linkedin_url: string | null;
  verified_by: string | null;
  verification_remarks: string;
  kyc_status: string;
  created_at: string;
  updated_at: string;
  registration_certificate: string | null;
  gst_certificate: string | null;
  address_proof: string | null;
  authorized_id_proof: string | null;
  bank_proof: string | null;
}

export interface KycData {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: KycRecord[];
}

export interface KycApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: KycData;
}

export const fetchPendingKycEmployers = async (
  page: number = 1,
  status: "Pending" | "Verified" | "Rejected" = "Pending"
): Promise<KycData> => {
  try {
    const response = await apiClient.get<KycApiResponse>(
      `user/v1/admin_kyc_management/?page=${page}&kyc_status=${status}`,
    );
    // Extracting the inner data properly to avoid 'results undefined' errors
    return response.data.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};

export const updateEmployerKycStatus = async (
  kycId: string,
  status: "Verified" | "Rejected",
  remarks?: string,
) => {
  const payload: { kyc_status: string; verification_remarks: string } = {
    kyc_status: status,
    verification_remarks: " ",
  };
  if (remarks) {
    payload.verification_remarks = remarks;
  }
  try {
    const response = await apiClient.patch(
      `user/v1/admin_kyc_management_detail/${kycId}/`,
      payload,
    );
    return response.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};

export const fetchKycDetail = async (kycId: string): Promise<KycRecord> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      status: number;
      message: string;
      data: KycRecord;
    }>(`user/v1/admin_kyc_management_detail/${kycId}/`);
    return response.data.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};
