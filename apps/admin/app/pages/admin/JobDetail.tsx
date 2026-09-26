import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useJobActions, useJobDetail } from "../../hooks/useJobs";
import Button from "../../components/legacy-ui/button/Button";
import Badge from "../../components/legacy-ui/badge/Badge";
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
import { Modal } from "../../components/legacy-ui/modal/model2";
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

  if (isLoading) return <JobDetailSkeleton />;

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-muted-foreground">
        <AlertCircle className="mb-4 h-16 w-16 text-destructive" />
        <h2 className="mb-2 text-2xl font-bold text-foreground">
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
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-sm font-medium">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft size={18} />
            <span>Back to Jobs</span>
          </button>
          <span className="text-muted-foreground/70">/</span>
          <span className="text-primary">Job Details</span>
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-6 shadow-xs md:flex-row md:items-start">
          <div className="flex items-start gap-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">
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

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {employerId && (
                  <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/50 px-3 py-1.5">
                    <Building size={15} className="text-primary" />
                    <span>
                      Employer ID:{" "}
                      <span className="font-semibold text-foreground">
                        {employerId.substring(0, 8)}...
                      </span>
                    </span>
                  </div>
                )}
                {city && country && (
                  <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/50 px-3 py-1.5">
                    <MapPin size={15} className="text-primary" />
                    <span className="font-medium text-foreground">
                      {city}, {country}
                    </span>
                  </div>
                )}
                {createdAt && (
                  <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/50 px-3 py-1.5">
                    <Clock size={15} className="text-primary" />
                    <span className="font-medium text-foreground">
                      Posted {new Date(createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {jobStatus !== "Approved" && (
            <div className="mt-4 flex w-full items-center gap-3 md:mt-0 md:ml-auto md:w-auto">
              {jobStatus === "Pending" && (
                <Button
                  variant="outline"
                  className="flex-1 border-destructive/50 text-destructive ring-destructive/20 hover:bg-destructive/10 hover:text-destructive md:flex-none"
                  startIcon={<XCircle size={18} />}
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  Reject
                </Button>
              )}
              <Button
                variant="primary"
                className="flex-1 border-transparent bg-green-600 shadow-xs hover:bg-green-700 md:flex-none"
                startIcon={<CheckCircle size={18} />}
                onClick={handleApprove}
                disabled={jobActionMutation.isPending}
              >
                {jobActionMutation.isPending
                  ? "Approving..."
                  : jobStatus === "Rejected"
                    ? "Re-Approve"
                    : "Approve"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {description && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-xs md:p-8">
              <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-foreground">
                <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
                  <FileText className="text-primary" size={20} />
                </div>
                About The Role
              </h2>
              <div className="leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {description}
              </div>
            </section>
          )}

          {responsibilities && responsibilities.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-xs md:p-8">
              <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-foreground">
                <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
                  <CheckCircle className="text-primary" size={20} />
                </div>
                Key Responsibilities
              </h2>
              <ul className="space-y-4">
                {responsibilities.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle size={14} />
                    </span>
                    <span className="leading-relaxed text-muted-foreground">
                      {req}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skills && skills.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-xs md:p-8">
              <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-foreground">
                <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
                  <Award className="text-primary" size={20} />
                </div>
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {skills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-primary/60 bg-primary/50 px-3.5 py-1.5 text-sm font-medium text-primary shadow-xs transition-colors hover:bg-primary/10"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {questions && questions.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-xs md:p-8">
              <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-foreground">
                <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
                  <AlertCircle className="text-primary" size={20} />
                </div>
                Screening Questions
              </h2>
              <ul className="space-y-4">
                {questions.map((q: string, idx: number) => (
                  <li
                    key={idx}
                    className="rounded-xl border border-border bg-card p-4 text-foreground shadow-xs transition-all hover:border-primary/60 hover:shadow-md"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                        {idx + 1}
                      </div>
                      <p className="pt-1 leading-relaxed font-medium text-foreground">
                        {q}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
                <Briefcase className="text-primary" size={20} />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Job Overview
              </h3>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
                  <IndianRupee size={20} />
                </div>
                <div>
                  <p className="mb-0.5 text-sm font-medium text-muted-foreground">
                    Salary Range
                  </p>
                  <p className="font-semibold text-foreground">
                    {salaryRange || "Not Disclosed"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="mb-0.5 text-sm font-medium text-muted-foreground">
                    Experience
                  </p>
                  <p className="font-semibold text-foreground">
                    {experienceRequired || "Not Specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Layers size={20} />
                </div>
                <div>
                  <p className="mb-0.5 text-sm font-medium text-muted-foreground">
                    Employment Type
                  </p>
                  <p className="font-semibold text-foreground capitalize">
                    {employmentType
                      ? employmentType.replace("_", " ")
                      : "Not Specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Building size={20} />
                </div>
                <div>
                  <p className="mb-0.5 text-sm font-medium text-muted-foreground">
                    Work Mode
                  </p>
                  <p className="font-semibold text-foreground capitalize">
                    {workMode || "Not Specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="mb-0.5 text-sm font-medium text-muted-foreground">
                    Deadline
                  </p>
                  <p className="font-semibold text-foreground">
                    {deadline
                      ? new Date(deadline).toLocaleDateString()
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {(minimumEducation || specialization) && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
                  <GraduationCap className="text-primary" size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Qualifications
                </h3>
              </div>
              <div className="space-y-4">
                {minimumEducation && (
                  <div>
                    <p className="mb-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap size={16} /> Minimum Education
                    </p>
                    <p className="pl-6 font-medium text-foreground">
                      {minimumEducation}
                    </p>
                  </div>
                )}
                {specialization && (
                  <div>
                    <p className="mb-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen size={16} /> Specialization
                    </p>
                    <p className="pl-6 font-medium text-foreground">
                      {specialization}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {jdFileUrl && (
            <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 to-primary/50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-primary">
                  Job Description
                </h3>
                <div className="rounded-lg bg-card p-2 text-primary shadow-xs">
                  <FileText size={20} />
                </div>
              </div>
              <p className="mb-5 text-sm text-primary">
                The employer has attached a detailed job description document.
              </p>
              <Button
                variant="primary"
                className="w-full justify-center border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                startIcon={<Download size={18} />}
                onClick={() => window.open(jdFileUrl, "_blank")}
              >
                View Document
              </Button>
            </div>
          )}

          {optimizedScore !== null && optimizedScore !== undefined && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
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
              <div className="mt-3 h-2.5 w-full rounded-full bg-muted">
                <div
                  className={`h-2.5 rounded-full transition-all duration-1000 ${
                    optimizedScore > 70
                      ? "bg-green-500"
                      : optimizedScore > 40
                        ? "bg-amber-500"
                        : "bg-destructive"
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
        className="max-w-md p-6 dark:border-border dark:bg-muted"
      >
        <h3 className="mb-2 text-lg font-bold text-foreground">Reject Jobs</h3>
        <p className="mt-5 mb-4 text-sm text-muted-foreground">
          Please provide a reason for rejecting the job. This reason may be
          visible to the employers.
        </p>

        <form onSubmit={handleSubmit(handleReject)}>
          <textarea
            {...register("rejectReason")}
            className="w-full rounded-xl border border-input bg-muted/50 p-3 text-foreground outline-hidden focus:border-ring focus:ring-ring/50"
            rows={4}
            placeholder="Enter rejection reason..."
          ></textarea>

          {errors.rejectReason && (
            <p className="mt-1 text-xs text-red-500">
              {errors.rejectReason.message}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={jobActionMutation.isPending}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-destructive/90 disabled:opacity-50"
            >
              {jobActionMutation.isPending ? "Rejecting..." : "Reject Jobs"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
