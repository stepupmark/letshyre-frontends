import React, { useRef, useState } from "react";
import { toast } from "@/lib/toast";
import { useTranslation } from "react-i18next";

import { JdUploadSection } from "@/features/employer/components/post-job/JdUploadSection";
import { JdFormPopup } from "@/features/employer/components/post-job/JdFormPopup";
import { SuccessPopup } from "@/features/employer/components/post-job/SuccessPopup";

import { useParseJD, useCreateJob } from "@/features/employer/hooks/useEmployerJobs";
import { useIndustries } from "@/hooks/useIndustries";
import { experienceText, salaryText } from "@/features/employer/lib/jobRanges";


export function PostJob({ editJobId = null }) {
  const { t } = useTranslation("employerJobs");
  const fileInputRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // New state for Job Title input during JD upload
  const [jdJobTitle, setJdJobTitle] = useState("");

  const [showJdPopup, setShowJdPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [_customIndustry, setCustomIndustry] = useState("");

  // ================= REACT QUERY HOOKS =================
  const { data: rawIndustries } = useIndustries();
  const parseJdMutation = useParseJD();
  const createJobMutation = useCreateJob();

  // Format industries data
  let industryOptions;
  if (rawIndustries && Array.isArray(rawIndustries)) {
    industryOptions = rawIndustries.map((item) => {
      if (typeof item === "object") {
        return { label: item.label, value: item.value };
      }
      return {
        label: item,
        value: item === "Others" ? "other" : item,
      };
    });
    if (!industryOptions.find((i) => i.value === "other")) {
      industryOptions.push({ label: "Others", value: "other" });
    }
  } else {
    industryOptions = [
      {
        label: "IT / Software Development",
        value: "IT / Software Development",
      },
      {
        label: "Digital Marketing / SEO",
        value: "Digital Marketing / SEO",
      },
      { label: "UI / UX Design", value: "UI / UX Design" },
      { label: "Others", value: "other" },
    ];
  }

  // ================= HELPERS =================
  const normalizeWorkType = (mode) => {
    if (!mode) return "";
    if (mode.toLowerCase().includes("remote")) return "Remote";
    if (mode.toLowerCase().includes("site")) return "On-site";
    if (mode.toLowerCase().includes("hybrid")) return "Hybrid";
    return "";
  };

  const normalizeEmploymentType = (type) => {
    if (!type) return "";
    const lower = type.toLowerCase();
    if (lower.includes("full")) return "Full Time";
    if (lower.includes("part")) return "Part Time";
    if (lower.includes("contract")) return "Contract";
    return "";
  };

  const normalizeDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("-") && dateStr.split("-")[0].length === 4) {
      return dateStr;
    }
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return "";
  };

  const normalizeIndustry = (industry) => {
    if (!industry) return "";

    const lower = industry.toLowerCase();

    if (lower.includes("it")) return "IT / Software Development";
    if (lower.includes("marketing")) return "Digital Marketing / SEO";
    if (lower.includes("design")) return "UI / UX Design";

    return "other";
  };

  // ================= STATE =================
  const [jobData, setJobData] = useState({
    title: "",
    work_type: "",
    employment_type: "",
    industry_type: "",

    must_have_skills: "",
    salary_range: "",

    country: "",
    state: "",
    city: "",

    education: "",
    specialization: "",

    description: "",
    job_description: "",

    experience_required: "",
    number_of_openings: "",
    application_deadline: "",
  });

  const _handleChange = (field, value) => {
    setJobData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  // ================= JD PARSING =================
  const handleJdUpload = async () => {
    if (!selectedFile) {
      toast.error(t("postJob.toasts.selectFile"));
      return;
    }
    if (!jdJobTitle.trim()) {
      toast.error(t("postJob.toasts.enterTitle"));
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", jdJobTitle.trim());

      const res = await parseJdMutation.mutateAsync(formData);

      const rawData = res.data?.data || res.data || {};
      const data = rawData.parse_response?.flat || rawData.parsed_fields || {};

      const expReq = experienceText(data.experience_min, data.experience_max);
      const salRange = salaryText(data.salary_min_lpa, data.salary_max_lpa);

      const skills = Array.isArray(data.required_skills)
        ? data.required_skills.join(", ")
        : data.skills_text || "";

      setJobData({
        title: data.job_title || jdJobTitle.trim(),
        work_type: normalizeWorkType(data.work_mode),
        employment_type: normalizeEmploymentType(data.employment_type),
        industry_type: normalizeIndustry(data.industry_type),

        must_have_skills: skills,
        salary_range: salRange,

        country: data.country || "",
        state: data.state || "",
        city: data.city || "",
        location: data.location || "",

        education: data.minimum_education || "",
        specialization: data.specialization || "",

        description: Array.isArray(data.responsibilities)
          ? data.responsibilities.join("\n")
          : data.responsibilities || "",
        job_description: data.job_description || "",

        experience_required: expReq,
        number_of_openings: data.number_of_openings ?? "",
        application_deadline: normalizeDate(data.application_deadline),
      });

      setShowJdPopup(true);
      toast.success(t("postJob.toasts.analyzed"));
    } catch (err) {
      console.error(err);
      const apiError =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        t("postJob.toasts.parseFailed");
      toast.error(
        typeof apiError === "string" ? apiError : t("postJob.toasts.parseFailed"),
      );
    }
  };

  const handlePostJob = async (validatedData) => {
    try {
      const payload = {
        title: validatedData.title,
        description: validatedData.description,
        country: validatedData.country,
        state: validatedData.state,
        city: validatedData.city,
        location: validatedData.location || "",

        work_mode:
          validatedData.work_type === "Hybrid"
            ? "hybrid"
            : validatedData.work_type === "Remote"
              ? "remote"
              : "on_site",

        employment_type:
          validatedData.employment_type === "Full Time"
            ? "full_time"
            : validatedData.employment_type === "Contract"
              ? "contract"
              : "part_time",

        industry_type:
          validatedData.industry_type === "other"
            ? validatedData.customIndustry || "other"
            : validatedData.industry_type,

        salary_range: validatedData.salary_range,
        experience_required: validatedData.experience_required,
        education_required: validatedData.education,
        specialization: validatedData.specialization,
        number_of_openings: Number(validatedData.number_of_openings) || 1,
        deadline: validatedData.application_deadline || null,

        skills_required: validatedData.must_have_skills
          ? validatedData.must_have_skills.split(",").map((s) => s.trim())
          : [],

        responsibilities: validatedData.description
          ? validatedData.description.split("\n")
          : [],

        is_active: true,
      };

      const formData = new FormData();
      formData.append("title", validatedData.title);
      formData.append("file", JSON.stringify(payload));

      // Attach JD File
      if (selectedFile) {
        formData.append("jd_file", selectedFile);
      }

      if (editJobId) {
        toast.info(t("postJob.toasts.editNotMigrated"));
      } else {
        await createJobMutation.mutateAsync(formData);
        toast.success(t("postJob.toasts.created"));
      }

      setShowJdPopup(false);
      setShowSuccess(true);

      // Clear all states after successful posting
      setFileName("");
      setSelectedFile(null);
      setJdJobTitle("");
      setCustomIndustry("");
    } catch (error) {
      console.error(error.response?.data);

      let errorMsg = t("postJob.toasts.postError");
      const resData = error.response?.data;

      if (resData?.errors) {
        const firstKey = Object.keys(resData.errors)[0];
        if (firstKey) {
          const firstError = resData.errors[firstKey];
          errorMsg = `${firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
        }
      } else if (resData?.message) {
        errorMsg = resData.message;
      }

      toast.error(errorMsg);
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      {/* `.emp-post-job-content` was never declared; only its descendant `h2`
          and `p` element selectors were styled, so the wrapper is a plain div
          and the type moves onto the elements that actually carried it. */}
      <div>
        <h2 className="mb-1 font-display text-2xl font-bold text-brand-700">{t("postJob.heading")}</h2>
        <p className="font-body text-sm text-text-muted">
          {t("postJob.subheadline")}
        </p>
      </div>

      <JdUploadSection
        fileName={fileName}
        jdJobTitle={jdJobTitle}
        setJdJobTitle={setJdJobTitle}
        handleClick={handleClick}
        handleJdUpload={handleJdUpload}
        isPending={parseJdMutation.isPending}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        selectedFile={selectedFile}
      />

      {showJdPopup && (
        <JdFormPopup
          jobData={jobData}
          industryOptions={industryOptions}
          setShowJdPopup={setShowJdPopup}
          handlePostJob={handlePostJob}
          isPending={createJobMutation.isPending}
        />
      )}

      {showSuccess && <SuccessPopup setShowSuccess={setShowSuccess} />}
    </div>
  );
}
