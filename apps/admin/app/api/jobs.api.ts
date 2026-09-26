import { http } from "~/lib/api/http-client";
import { toApiError } from "~/lib/api/api-error";
import {
  JobDetail,
  JobDetailApiResponse,
  mapJobDetailFromApi,
} from "./jobDetailTypes";

export type JobStatus = "open" | "paused" | "closed";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface JobFilters {
  search?: string;
  jobStatus?: JobStatus;
  approvalStatus?: ApprovalStatus;
  fromDate?: string;
  toDate?: string;
  page: number;
}

export interface Job {
  id: string;
  companyName: string;
  jobTitle: string;
  employerName: string;
  applicationsCount: number;
  employmentType: string;
  industryType: string;
  createdDate: string;
  jobStatus: JobStatus;
  approvalStatus: ApprovalStatus;
}

export interface PaginatedJobs {
  count: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  next: string | null;
  previous: string | null;
  results: Job[];
}

type BackendJobStatus = "Open" | "Closed" | "Paused";

interface BackendJob {
  id: string;
  company_name: string;
  title: string;
  employer_name: string;
  applications_count: number;
  employment_type: string;
  industry_type: string;
  created_at: string;
  status: BackendJobStatus;
  is_approved: boolean;
  is_rejected: boolean;
  is_pending: boolean;
}

interface BackendJobsData {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: BackendJob[];
}

export interface JobsApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: BackendJobsData;
}

export type JobManagementCardsResponse = {
  success: boolean;
  status: number;
  message: string;
  data: {
    total_post_jobs: number;
    today_job_posts: number;
    approved_jobs: number;
    rejected_jobs: number;
    pending_approvals: number;
    open_jobs: number;
    closed_jobs: number;
    total_applications: number;
  };
};

export function mapFiltersToApi(filters: JobFilters): Record<string, string> {
  const params: Record<string, string> = {
    page: filters.page.toString(),
  };

  if (filters.search) {
    params.search = filters.search;
  }

  if (filters.jobStatus) {
    params.status =
      filters.jobStatus.charAt(0).toUpperCase() + filters.jobStatus.slice(1);
  }

  if (filters.approvalStatus) {
    if (filters.approvalStatus === "pending") params.is_pending = "true";
    else if (filters.approvalStatus === "approved") params.is_approved = "true";
    else if (filters.approvalStatus === "rejected") params.is_rejected = "true";
  }

  if (filters.fromDate) params.from_date = filters.fromDate;
  if (filters.toDate) params.end_date = filters.toDate;

  return params;
}

export function mapJobFromApi(backendJob: BackendJob): Job {
  let approvalStatus: ApprovalStatus = "pending";
  if (backendJob.is_approved) approvalStatus = "approved";
  else if (backendJob.is_rejected) approvalStatus = "rejected";

  let jobStatus: JobStatus = "open";
  if (backendJob.status === "Closed") jobStatus = "closed";
  else if (backendJob.status === "Paused") jobStatus = "paused";

  return {
    id: backendJob.id,
    companyName: backendJob.company_name,
    jobTitle: backendJob.title,
    employerName: backendJob.employer_name,
    applicationsCount: backendJob.applications_count,
    employmentType: backendJob.employment_type,
    industryType: backendJob.industry_type,
    createdDate: backendJob.created_at,
    jobStatus,
    approvalStatus,
  };
}

export async function fetchJobs(filters: JobFilters): Promise<PaginatedJobs> {
  const params = mapFiltersToApi(filters);
  const searchParams = new URLSearchParams(params);

  try {
    const response = await http.get<JobsApiResponse>(
      `/user/v1/admin/jobs/?${searchParams.toString()}`,
    );

    const data = response.data.data;

    return {
      count: data.count,
      totalPages: data.total_pages || 1,
      currentPage: data.current_page || 1,
      pageSize: data.page_size || 10,
      next: data.next,
      previous: data.previous,
      results: (data.results || []).map(mapJobFromApi),
    };
  } catch (err) {
    throw toApiError(err);
  }
}

export async function fetchJobById(id: string): Promise<JobDetail> {
  try {
    const response = await http.get<JobDetailApiResponse>(
      `user/v1/admin/job-detail/${id}`,
    );

    return mapJobDetailFromApi(response.data.data);
  } catch (err) {
    throw toApiError(err);
  }
}

export async function approveJob(jobId: string): Promise<void> {
  try {
    await http.patch(`/user/v1/admin/jobs/${jobId}/approve/`);
  } catch (err) {
    throw toApiError(err);
  }
}

export async function rejectJob(jobId: string): Promise<void> {
  try {
    await http.patch(`/user/v1/admin/jobs/${jobId}/reject/`);
  } catch (err) {
    throw toApiError(err);
  }
}

export async function updateJobStatus(
  jobId: string,
  status: "Open" | "Paused" | "Closed",
): Promise<void> {
  try {
    await http.patch(`/user/v1/admin/jobs/${jobId}/status/`, { status });
  } catch (err) {
    throw toApiError(err);
  }
}

export async function deleteJob(jobId: string, reason?: string): Promise<void> {
  try {
    await http.delete(`/user/v1/admin/job/${jobId}/remove/`, {
      data: reason,
    });
  } catch (err) {
    throw toApiError(err);
  }
}

export const JobManagementCards =
  async (): Promise<JobManagementCardsResponse> => {
    try {
      const response = await http.get<JobManagementCardsResponse>(
        `user/v1/admin/jobs/dashboard/cards/`,
      );
      return response.data;
    } catch (err) {
      throw toApiError(err);
    }
  };

export async function bulkActionJobs(data: {
  action: "approve" | "reject" | "delete";
  job_ids: string[];
  reason?: string;
}): Promise<void> {
  try {
    await http.post(`/user/v1/admin/bulk_approvals/job/`, data);
  } catch (err) {
    throw toApiError(err);
  }
}
