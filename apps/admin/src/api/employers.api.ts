import { apiClient } from "./axiosInstance";
import { extractMessage } from "./apiError";

export interface EmployerKyc {
  id: string;
  employer: string;
  company_name: string;
  company_logo: string | null;
  company_website: string | null;
  company_description: string | null;
  reference: string | null;
  company_industry: string | null;
  company_registration_number: string | null;
  gst_number: string | null;
  pan_number: string | null;
  company_address: string | null;
  website_url: string | null;
  official_email: string | null;
  linkedin_url: string | null;
  verified_by: string | null;
  verification_remarks: string | null;
  kyc_status: string;
  created_at: string;
  updated_at: string;
  registration_certificate: string | null;
  gst_certificate: string | null;
  address_proof: string | null;
  authorized_id_proof: string | null;
  bank_proof: string | null;
}

export interface Employer {
  id: string;
  user_name: string;
  email: string;
  phone_number: string;
  role: string;
  job_posts: number;
  employer_kyc: EmployerKyc | null;
}

export interface EmployersData {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: Employer[];
}

export interface EmployersApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: EmployersData;
}

export interface EmployerProfileApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: Employer;
}

export type EmployerDashboardCardsResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    total_employees: number;
    today_registerations: number;
    completed_kycs: number;
    in_completed_kycs: number;
    pending_kycs: number;
    verified_kycs: number;
  };
};

export const fetchEmployers = async (
  page: number = 1,
): Promise<EmployersData> => {
  const params = new URLSearchParams({ page: page.toString() });

  try {
    const response = await apiClient.get<EmployersApiResponse>(
      `user/v1/admin/employers/?${params.toString()}`,
    );
    return response.data.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};

export const fetchEmployerProfile = async (id: string): Promise<Employer> => {
  try {
    const response = await apiClient.get<EmployerProfileApiResponse>(
      `user/v1/admin/employer_detail/${id}/`,
    );
    return response.data.data;
  } catch (err) {
    throw new Error(extractMessage(err));
  }
};

export const employerCards =
  async (): Promise<EmployerDashboardCardsResponse> => {
    try {
      const response = await apiClient.get<EmployerDashboardCardsResponse>(
        `user/v1/admin/employer/cards/`,
      );
      return response.data;
    } catch (err) {
      throw new Error(extractMessage(err));
    }
  };
