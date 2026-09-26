import { http } from "~/lib/api/http-client";
import { toApiError } from "~/lib/api/api-error";

export interface Candidate {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  is_verified: boolean;
  is_profile_complete: boolean;
  profile_completion_score: number;
  location: string | null;
  preferred_industry: string | null;
  created_at: string;
  updated_at: string;
  gender?: string | null;
  resume?: string | null;
}

export interface CandidatesData {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: Candidate[];
}

export interface CandidatesApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: CandidatesData;
}

export interface CandidateProfileData {
  id: string;
  user: string;
  name: string;
  email: string;
  phone_number: string;
  profile_photo: string | null;
  dob: string | null;
  gender: string | null;
  location: string | null;
  education: { institution: string; degree: string; year: string }[];
  experience: { company: string; role: string; duration: string }[];
  skills: string[];
  resume: string | null;
  resume_url: string | null;
  projects: { title: string; description: string; link?: string }[];
  accomplishments: string[];
  address: string | null;
  interview_score: number[];
  job_preferences: any;
  preferred_locations: string[];
  preferred_industry: string | null;
  portfolio_links: string[];
  current_ctc: number | null;
  expected_ctc: number | null;
  notice_period: string | null;
  notice_period_prof_type: string | null;
  notice_period_prof: string | null;
  cover_letter: string | null;
  is_verified: boolean;
  is_profile_complete: boolean;
  profile_completion_score: number;
  created_at: string;
  updated_at: string;
  aadhar_number: string | null;
  present_or_last_working_company: string | null;
  last_day_of_working: string | null;
  resignation_letter: string | null;
  experience_letter: string | null;
  present_offer: string | null;
  role: string | null;
  // missing on older records
  is_approved?: boolean;
  is_rejected?: boolean;
}

export interface CandidateProfileApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: CandidateProfileData;
}

export type CandidateDashboardCardsResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    total_candidates: number;
    today_registrations: number;
    completed_profiles: number;
    in_completed_profiles: number;
    verified_candidates: number;
  };
};

export interface CandidateApprovalPayload {
  is_approved?: boolean;
  is_rejected?: boolean;
}

export interface CandidateApprovalResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    id: string;
    is_approved: boolean;
    is_rejected: boolean;
  };
}

export const fetchCandidates = async (
  page: number = 1,
  search?: string,
  gender?: string,
  industry?: string,
  kyc?: string,
  complete?: string,
): Promise<CandidatesData> => {
  const params = new URLSearchParams({ page: page.toString() });
  if (search) params.append("search", search);
  if (gender) params.append("gender", gender);
  if (industry) params.append("preferred_industry", industry);
  if (kyc === "verified") params.append("is_verified", "true");
  if (kyc === "unverified") params.append("is_verified", "false");
  if (complete === "complete") params.append("is_profile_complete", "true");
  if (complete === "incomplete") params.append("is_profile_complete", "false");

  try {
    const response = await http.get<CandidatesApiResponse>(
      `user/v1/admin/candidates/?${params.toString()}`,
    );
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const fetchCandidateProfile = async (
  id: string,
): Promise<CandidateProfileData> => {
  try {
    const response = await http.get<CandidateProfileApiResponse>(
      `user/v1/admin/candidate_profile/${id}/`,
    );
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
};

export const candidatesCards =
  async (): Promise<CandidateDashboardCardsResponse> => {
    try {
      const response = await http.get<CandidateDashboardCardsResponse>(
        `user/v1/admin/candidate/dashboard/cards/`,
      );

      return response.data;
    } catch (err) {
      throw toApiError(err);
    }
  };

export const updateCandidateApproval = async (
  profileId: string,
  payload: CandidateApprovalPayload,
): Promise<CandidateApprovalResponse["data"]> => {
  try {
    const response = await http.put<CandidateApprovalResponse>(
      `user/v1/admin/candidate_profile/${profileId}/`,
      payload,
    );
    return response.data.data;
  } catch (err) {
    throw toApiError(err);
  }
};
