import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useJobActions, useJobDetail } from "../../hooks/useJobs";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import {
  JobRejectFormValues,
  jobRejectSchema,
} from "../../schemas/jobReject.schema";

import {
  AlertCircle,
  MapPin,
  IndianRupee,
  Briefcase,
  FileText,
  Download,
  Building,
  Clock,
  ArrowLeft,
  ChevronLeft,
  CheckCircle,
  XCircle,
  GraduationCap,
  Calendar,
  Layers,
  Award,
  BookOpen,
} from "lucide-react";
import { Modal } from "../../components/ui/modal/model2";
import { useState } from "react";
import JobDetailSkeleton from "../../components/Skeletons/JobDetailSkeleton";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobRejectFormValues>({
    resolver: zodResolver(jobRejectSchema),
    defaultValues: { rejectReason: "" },
  });

  const { data, isLoading, error } = useJobDetail(id as string);

  const jobActionMutation = useJobActions();

  const handleApprove = () => {
    jobActionMutation.mutate({ action: "approve", job_ids: [id as string] });
  };

  const handleReject = (formData: JobRejectFormValues) => {
    jobActionMutation.mutate(
      {
        action: "reject",
        job_ids: [id as string],
        reason: formData.rejectReason,
      },
      {
        onSuccess: () => {
          setIsRejectModalOpen(false);
          reset();
        },
      },
    );
  };

  // const handleReject = () => {
  //   if (!rejectReason.trim()) {
  //     toast.error("Please provide a reason for rejection");
  //     return;
  //   }
  //   bulkActionMutation.mutate(
  //     { action: "reject", job_ids: selectedRows, reason: rejectReason },
  //     {
  //       onSuccess: () => {
  //         setIsRejectModalOpen(false);
  //         setRejectReason("");
  //         onClearSelection();
  //       },
  //     },
  //   );
  // };

  if (isLoading) return <JobDetailSkeleton />;

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <AlertCircle className="w-16 h-16 mb-4 text-error-400" />
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Failed to load job details
        </h2>
        <p className="mb-6">
          The job you are looking for does not exist or an error occurred.
        </p>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          startIcon={<ArrowLeft size={18} />}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const {
    title,
    employerId,
    description,
    jdFileUrl,
    responsibilities,
    city,
    country,
    workMode,
    employmentType,
    salaryRange,
    experienceRequired,
    skills,
    minimumEducation,
    specialization,
    questions,
    optimizedScore,
    deadline,
    jobStatus,
    status,
    createdAt,
  } = data;

  return (
    <div className="mx-auto space-y-8 font-sans max-w-7xl">
      {/* Header Area */}
      <div className="space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-3 text-sm font-medium">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-brand-600 transition-colors"
          >
            <ChevronLeft size={18} />
            <span>Back to Jobs</span>
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-brand-900">Job Details</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col justify-between gap-6 p-6 bg-white border border-gray-100 shadow-sm md:flex-row md:items-start rounded-2xl dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
                  {title || "Untitled Job"}
                </h1>
                <Badge
                  color={
                    status === "Open"
                      ? "success"
                      : status === "Closed"
                        ? "error"
                        : "warning"
                  }
                  variant="light"
                >
                  {status || "Unknown"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-600">
                {employerId && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100/80">
                    <Building size={15} className="text-brand-500" />
                    <span>
                      Employer ID:{" "}
                      <span className="font-semibold text-gray-800">
                        {employerId.substring(0, 8)}...
                      </span>
                    </span>
                  </div>
                )}
                {city && country && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100/80">
                    <MapPin size={15} className="text-brand-500" />
                    <span className="font-medium text-gray-800">
                      {city}, {country}
                    </span>
                  </div>
                )}
                {createdAt && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100/80">
                    <Clock size={15} className="text-brand-500" />
                    <span className="font-medium text-gray-800">
                      Posted {new Date(createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {jobStatus !== "Approved" && (
            <div className="flex items-center w-full gap-3 mt-4 md:ml-auto md:w-auto md:mt-0">
              {jobStatus === "Pending" && (
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none text-error-600 hover:bg-error-50 hover:text-error-700 ring-error-200 border-error-200"
                  startIcon={<XCircle size={18} />}
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  Reject
                </Button>
              )}
              <Button
                variant="primary"
                className="flex-1 border-transparent shadow-sm md:flex-none bg-success-600 hover:bg-success-700"
                startIcon={<CheckCircle size={18} />}
                onClick={handleApprove}
                disabled={
                  jobActionMutation.isPending ||
                  (jobActionMutation as any).isLoading
                }
              >
                {jobActionMutation.isPending ||
                (jobActionMutation as any).isLoading
                  ? "Approving..."
                  : jobStatus === "Rejected"
                    ? "Re-Approve"
                    : "Approve"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 ">
        {/* Left Column: Job Details */}
        <div className="space-y-8 lg:col-span-2">
          {/* About The Role */}
          {description && (
            <section className="p-6 bg-white border border-gray-100 shadow-sm md:p-8 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
              <h2 className="flex items-center gap-3 mb-5 text-xl font-bold text-gray-900 dark:text-white">
                <div className="flex items-center justify-center p-2 rounded-lg bg-brand-50">
                  <FileText className="text-brand-600" size={20} />
                </div>
                About The Role
              </h2>
              <div className="leading-relaxed prose text-gray-600 whitespace-pre-wrap max-w-none">
                {description}
              </div>
            </section>
          )}

          {/* Responsibilities */}
          {responsibilities && responsibilities.length > 0 && (
            <section className="p-6 bg-white border border-gray-100 shadow-sm md:p-8 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
              <h2 className="flex items-center gap-3 mb-5 text-xl font-bold text-gray-900 dark:text-white">
                <div className="flex items-center justify-center p-2 rounded-lg bg-brand-50">
                  <CheckCircle className="text-brand-600" size={20} />
                </div>
                Key Responsibilities
              </h2>
              <ul className="space-y-4">
                {responsibilities.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center">
                      <CheckCircle size={14} />
                    </span>
                    <span className="leading-relaxed text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Skills Required */}
          {skills && skills.length > 0 && (
            <section className="p-6 bg-white border border-gray-100 shadow-sm md:p-8 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
              <h2 className="flex items-center gap-3 mb-5 text-xl font-bold text-gray-900 dark:text-white">
                <div className="flex items-center justify-center p-2 rounded-lg bg-brand-50">
                  <Award className="text-brand-600" size={20} />
                </div>
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 bg-brand-50/50 border border-brand-100/60 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-50 transition-colors shadow-sm dark:text-white dark:bg-brand-900 dark:border-brand-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Screening Questions */}
          {questions && questions.length > 0 && (
            <section className="p-6 bg-white border border-gray-100 shadow-sm md:p-8 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
              <h2 className="flex items-center gap-3 mb-5 text-xl font-bold text-gray-900 dark:text-white">
                <div className="flex items-center justify-center p-2 rounded-lg bg-brand-50">
                  <AlertCircle className="text-brand-600" size={20} />
                </div>
                Screening Questions
              </h2>
              <ul className="space-y-4">
                {questions.map((q: string, idx: number) => (
                  <li
                    key={idx}
                    className="p-4 text-gray-700 transition-all bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md hover:border-brand-100/60 dark:bg-slate-900 dark:border-slate-800"
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-semibold rounded-lg bg-brand-50 text-brand-600">
                        {idx + 1}
                      </div>
                      <p className="pt-1 font-medium leading-relaxed text-gray-800 dark:text-white">
                        {q}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right Column: Meta Info & Actions */}
        <div className="space-y-6">
          {/* Job Overview Card */}
          <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center p-2 rounded-lg bg-brand-50">
                <Briefcase className="text-brand-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Job Overview
              </h3>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl flex-shrink-0">
                  <IndianRupee size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-0.5">
                    Salary Range
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {salaryRange || "Not Disclosed"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl flex-shrink-0">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-0.5">
                    Experience
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {experienceRequired || "Not Specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl flex-shrink-0">
                  <Layers size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-0.5">
                    Employment Type
                  </p>
                  <p className="font-semibold text-gray-900 capitalize dark:text-white">
                    {employmentType
                      ? employmentType.replace("_", " ")
                      : "Not Specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl flex-shrink-0">
                  <Building size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-0.5">
                    Work Mode
                  </p>
                  <p className="font-semibold text-gray-900 capitalize dark:text-white">
                    {workMode || "Not Specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl flex-shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-0.5">
                    Deadline
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {deadline
                      ? new Date(deadline).toLocaleDateString()
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Education & Qualifications */}
          {(minimumEducation || specialization) && (
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center p-2 rounded-lg bg-brand-50">
                  <GraduationCap className="text-brand-600" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Qualifications
                </h3>
              </div>
              <div className="space-y-4">
                {minimumEducation && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mb-1.5">
                      <GraduationCap size={16} /> Minimum Education
                    </p>
                    <p className="pl-6 font-medium text-gray-900 dark:text-white">
                      {minimumEducation}
                    </p>
                  </div>
                )}
                {specialization && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mb-1.5">
                      <BookOpen size={16} /> Specialization
                    </p>
                    <p className="pl-6 font-medium text-gray-900 dark:text-white">
                      {specialization}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* JD Document */}
          {jdFileUrl && (
            <div className="p-6 border bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-2xl border-brand-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-brand-900">
                  Job Description
                </h3>
                <div className="p-2 bg-white rounded-lg shadow-sm text-brand-600">
                  <FileText size={20} />
                </div>
              </div>
              <p className="mb-5 text-sm text-brand-700">
                The employer has attached a detailed job description document.
              </p>
              <Button
                variant="primary"
                className="justify-center w-full text-white border-transparent bg-brand-600 hover:bg-brand-700"
                startIcon={<Download size={18} />}
                onClick={() => window.open(jdFileUrl, "_blank")}
              >
                View Document
              </Button>
            </div>
          )}

          {/* Optimization Score */}
          {optimizedScore !== null && optimizedScore !== undefined && (
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-white">
                  JD Quality Score
                </h3>
                <Badge
                  color={
                    optimizedScore > 70
                      ? "success"
                      : optimizedScore > 40
                        ? "warning"
                        : "error"
                  }
                  variant="light"
                >
                  {optimizedScore}/100
                </Badge>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mt-3">
                <div
                  className={`h-2.5 rounded-full transition-all duration-1000 ${
                    optimizedScore > 70
                      ? "bg-success-500"
                      : optimizedScore > 40
                        ? "bg-warning-500"
                        : "bg-error-500"
                  }`}
                  style={{ width: `${optimizedScore}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        className="max-w-md p-6 dark:bg-slate-800 dark:border-slate-800"
      >
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          Reject Jobs
        </h3>
        <p className="mt-5 mb-4 text-sm text-gray-500 dark:text-gray-400">
          Please provide a reason for rejecting the job. This reason may be
          visible to the employers.
        </p>

        <form onSubmit={handleSubmit(handleReject)}>
          <textarea
            {...register("rejectReason")}
            className="w-full p-3 text-gray-900 border border-gray-300 outline-none dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-brand-500 focus:border-brand-500"
            rows={4}
            placeholder="Enter rejection reason..."
          ></textarea>

          {errors.rejectReason && (
            <p className="mt-1 text-xs text-red-500">
              {errors.rejectReason.message}
            </p>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={jobActionMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-error-500 hover:bg-error-600 disabled:opacity-50"
            >
              {jobActionMutation.isPending ? "Rejecting..." : "Reject Jobs"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
