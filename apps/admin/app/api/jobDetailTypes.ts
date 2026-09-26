export type WorkMode = "remote" | "onsite" | "hybrid";
export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship"
  | "freelance";

export type JobStatus = "Approved" | "Pending" | "Rejected";

export interface JobDetailApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: JobDetailApi;
}

export interface JobDetailApi {
  id: string;
  employer: string;
  title: string;
  description: string;
  jd_file_url: string | null;

  responsibilities: string[];
  number_of_openings: number | null;

  location: string;
  country: string;
  state: string;
  city: string;

  work_mode: WorkMode;
  employment_type: EmploymentType;
  industry_type: string;

  salary_range: string;
  salary_min_lpa: number | null;
  salary_max_lpa: number | null;

  experience_required: string;
  experience_min_years: number | null;
  experience_max_years: number | null;

  skills_required: string[];

  minimum_education: string;
  specialization: string;

  questions: string[];

  optimized_score: number | null;
  keywords: string[];

  ai_generated_jd: boolean;
  ai_optimized_score: number | null;
  ai_keywords: string[];

  deadline: string | null;
  application_deadline: string | null;

  job_status: JobStatus;
  status: string;

  created_at: string;
  updated_at: string;
  job_posted_date: string;
}

export interface JobDetail {
  id: string;
  employerId: string;

  title: string;
  description: string;
  jdFileUrl: string | null;

  responsibilities: string[];
  openings: number | null;

  location: string;
  country: string;
  state: string;
  city: string;

  workMode: WorkMode;
  employmentType: EmploymentType;
  industryType: string;

  salaryRange: string;
  salaryMinLpa: number | null;
  salaryMaxLpa: number | null;

  experienceRequired: string;
  experienceMinYears: number | null;
  experienceMaxYears: number | null;

  skills: string[];

  minimumEducation: string;
  specialization: string;

  questions: string[];

  optimizedScore: number | null;
  keywords: string[];

  aiGeneratedJd: boolean;
  aiOptimizedScore: number | null;
  aiKeywords: string[];

  deadline: string | null;
  applicationDeadline: string | null;

  jobStatus: JobStatus;
  status: string;

  createdAt: string;
  updatedAt: string;
  postedDate: string;
}

export const mapJobDetailFromApi = (job: JobDetailApi): JobDetail => ({
  id: job.id,
  employerId: job.employer,

  title: job.title,
  description: job.description,
  jdFileUrl: job.jd_file_url,

  responsibilities: job.responsibilities || [],
  openings: job.number_of_openings,

  location: job.location,
  country: job.country,
  state: job.state,
  city: job.city,

  workMode: job.work_mode,
  employmentType: job.employment_type,
  industryType: job.industry_type,

  salaryRange: job.salary_range,
  salaryMinLpa: job.salary_min_lpa,
  salaryMaxLpa: job.salary_max_lpa,

  experienceRequired: job.experience_required,
  experienceMinYears: job.experience_min_years,
  experienceMaxYears: job.experience_max_years,

  skills: job.skills_required || [],

  minimumEducation: job.minimum_education,
  specialization: job.specialization,

  questions: job.questions || [],

  optimizedScore: job.optimized_score,
  keywords: job.keywords || [],

  aiGeneratedJd: job.ai_generated_jd,
  aiOptimizedScore: job.ai_optimized_score,
  aiKeywords: job.ai_keywords || [],

  deadline: job.deadline,
  applicationDeadline: job.application_deadline,

  jobStatus: job.job_status,
  status: job.status,

  createdAt: job.created_at,
  updatedAt: job.updated_at,
  postedDate: job.job_posted_date,
});
