import { useState, useMemo } from "react";
import { resolveIndustryValue } from "@/features/employer/lib/industry";
import { showSuccess, showError } from "@/lib/toast";
import { experienceText, parseRange, salaryText } from "@/features/employer/lib/jobRanges";

const STEP_COUNT = 3;

const PAIRED = {
  salary_min_lpa: "salary_max_lpa",
  salary_max_lpa: "salary_min_lpa",
  experience_min_years: "experience_max_years",
  experience_max_years: "experience_min_years",
};

const toNumber = (value) => (value === "" || value == null ? null : Number(value));

// Numbers load as they are, so 0 stays 0. Older jobs may only have the text;
// read the numbers from it, or keep the text if it has none.
function initialRange(min, max, text) {
  if (min != null || max != null) return { min: min ?? "", max: max ?? "", text: "" };
  const parsed = parseRange(text);
  return parsed ? { ...parsed, text: "" } : { min: "", max: "", text: text || "" };
}

const FALLBACK_INDUSTRIES = [
  { label: "IT / Software Development", value: "IT / Software Development" },
  { label: "Digital Marketing / SEO", value: "Digital Marketing / SEO" },
  { label: "UI / UX Design", value: "UI / UX Design" },
  { label: "Finance & Accounting", value: "Finance & Accounting" },
  { label: "Healthcare & Medical", value: "Healthcare & Medical" },
  { label: "Human Resources / Recruitment", value: "Human Resources / Recruitment" },
  { label: "Sales & Business Development", value: "Sales & Business Development" },
  { label: "Education & Teaching", value: "Education & Teaching" },
  { label: "Others", value: "other" },
];

export function useEditJobForm({ job, onClose, updateMutation, rawIndustries, t }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

  // Normalize industries data whether API returns strings or objects, with fallback
  const industryOptions = useMemo(() => {
    let options;
    if (rawIndustries && Array.isArray(rawIndustries) && rawIndustries.length > 0) {
      options = rawIndustries.map((item) => {
        if (typeof item === "object" && item !== null) {
          return { label: item.label || item.name, value: item.value || item.id || item.label };
        }
        return {
          label: String(item),
          value: item === "Others" ? "other" : String(item),
        };
      });
    } else {
      options = [...FALLBACK_INDUSTRIES];
    }

    // Ensure "Others" option is always available
    if (!options.some((opt) => opt.value === "other" || opt.label === "Others")) {
      options.push({ label: "Others", value: "other" });
    }

    // Ensure current job industry is present in options so dropdown displays it
    if (
      job.industry_type &&
      !options.some((opt) => opt.value === job.industry_type || opt.label === job.industry_type)
    ) {
      options.unshift({ label: job.industry_type, value: job.industry_type });
    }

    return options;
  }, [rawIndustries, job.industry_type]);

  // Initial skills array parsing
  const initialSkills = useMemo(() => {
    if (Array.isArray(job.skills_required)) return job.skills_required;
    if (typeof job.skills_required === "string") {
      return job.skills_required
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, [job.skills_required]);

  const [skillsList, setSkillsList] = useState(initialSkills);
  const [skillInput, setSkillInput] = useState("");

  const [salary] = useState(() => {
    const range = initialRange(job.salary_min_lpa, job.salary_max_lpa, job.salary_range);
    // A 0–0 salary means not disclosed.
    return Number(range.min) === 0 && Number(range.max) === 0 && range.min !== "" && range.max !== ""
      ? { ...range, min: "", max: "" }
      : range;
  });
  const [experience] = useState(() =>
    initialRange(job.experience_min_years, job.experience_max_years, job.experience_required),
  );

  const [editingJob, setEditingJob] = useState({
    id: job.id,
    title: job.title || "",
    work_type: job.work_mode || "",
    employment_type: job.employment_type || "",
    industry: job.industry_type || "",
    openings: job.number_of_openings || 1,
    country: job.country || "",
    state: job.state || "",
    city: job.city || "",
    education: job.minimum_education || "",
    specialization: job.specialization || "",
    deadline: job.deadline || "",
    application_deadline: job.application_deadline || "",
    overview: job.description || "",
    responsibilities: Array.isArray(job.responsibilities)
      ? job.responsibilities.join("\n")
      : job.responsibilities || "",
    location: job.location || "",
    jd_file_url: job.jd_file_url || null,
    salary_min_lpa: salary.min,
    salary_max_lpa: salary.max,
    experience_min_years: experience.min,
    experience_max_years: experience.max,
    questions: job.questions || [],
    keywords: job.keywords || [],
    job_status: job.job_status || "",
    status: job.status || "",
  });

  // The stored industry may be a label or legacy string that doesn't equal any
  // option's value, which would render the trigger blank. Derive the canonical
  // value for display (options already surface a truly-unknown value), rather
  // than syncing it into state.
  const selectedIndustry = resolveIndustryValue(
    editingJob.industry,
    industryOptions,
  );

  // What candidates will see; kept text only survives while no numbers are set.
  const salaryRange =
    salaryText(toNumber(editingJob.salary_min_lpa), toNumber(editingJob.salary_max_lpa)) ||
    salary.text;
  const experienceRange =
    experienceText(toNumber(editingJob.experience_min_years), toNumber(editingJob.experience_max_years)) ||
    experience.text;

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
    if (showConfirmDiscard) setShowConfirmDiscard(false);
  };

  // A min/max error can sit on either field, so editing one clears both.
  const clearErrors = (field) => {
    const fields = [field, PAIRED[field]].filter((name) => name && errors[name]);
    if (fields.length) {
      setErrors((prev) => ({ ...prev, ...Object.fromEntries(fields.map((name) => [name, null])) }));
    }
  };

  const set = (field) => (e) => {
    markDirty();
    setEditingJob((prev) => ({ ...prev, [field]: e.target.value }));
    clearErrors(field);
  };

  const setValue = (field) => (value) => {
    markDirty();
    setEditingJob((prev) => ({ ...prev, [field]: value }));
    clearErrors(field);
  };

  const checkRange = (minField, maxField, { limit, whole }, invalid, order) => {
    const found = {};
    for (const field of [minField, maxField]) {
      const value = toNumber(editingJob[field]);
      if (value === null) continue;
      if (!Number.isFinite(value) || value < 0 || value > limit || (whole && !Number.isInteger(value))) {
        found[field] = invalid;
      }
    }
    const min = toNumber(editingJob[minField]);
    const max = toNumber(editingJob[maxField]);
    if (!found[minField] && !found[maxField] && min !== null && max !== null && min > max) {
      found[maxField] = order;
    }
    return found;
  };

  // Interactive skills tag handlers
  const handleAddSkill = (skillToAdd = skillInput) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (!skillsList.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillsList((prev) => [...prev, trimmed]);
      markDirty();
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (indexToRemove) => {
    setSkillsList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    markDirty();
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleCloseAttempt = () => {
    if (isDirty && !showConfirmDiscard) {
      setShowConfirmDiscard(true);
      return;
    }
    onClose();
  };

  // Step validation
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!editingJob.title?.trim()) {
        newErrors.title = t("editJob.errors.titleRequired");
      }
    }
    if (step === 2) {
      if (!editingJob.openings || Number(editingJob.openings) < 1) {
        newErrors.openings = t("editJob.errors.openingsMin");
      }
      Object.assign(
        newErrors,
        checkRange(
          "salary_min_lpa",
          "salary_max_lpa",
          { limit: 500 },
          t("editJob.errors.salaryInvalid"),
          t("editJob.errors.salaryOrder"),
        ),
        checkRange(
          "experience_min_years",
          "experience_max_years",
          { limit: 50, whole: true },
          t("editJob.errors.experienceInvalid"),
          t("editJob.errors.experienceOrder"),
        ),
      );
    }
    if (step === 3) {
      if (!editingJob.overview?.trim()) {
        newErrors.overview = t("editJob.errors.overviewRequired");
      }
      if (
        editingJob.deadline &&
        !/^\d{4}-\d{2}-\d{2}$/.test(editingJob.deadline)
      ) {
        newErrors.deadline = t("editJob.errors.deadlineFormat");
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(STEP_COUNT, prev + 1));
    } else {
      showError(t("editJob.toasts.fixRequired"));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleStepClick = (targetStep) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
    } else if (targetStep > currentStep) {
      // Ensure current step is valid before skipping forward
      if (validateStep(currentStep)) {
        setCurrentStep(targetStep);
      } else {
        showError(t("editJob.toasts.completeStep"));
      }
    }
  };

  const handleUpdate = () => {
    // Validate all steps before submitting
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);

    if (!step1Valid || !step2Valid || !step3Valid) {
      showError(t("editJob.toasts.checkAllSteps"));
      if (!step1Valid) setCurrentStep(1);
      else if (!step2Valid) setCurrentStep(2);
      else setCurrentStep(3);
      return;
    }
    setErrors({});

    const payload = {
      title: editingJob.title.trim(),
      work_mode: editingJob.work_type,
      employment_type: editingJob.employment_type,
      industry_type: selectedIndustry,
      skills_required: skillsList,
      salary_range: salaryRange,
      experience_required: experienceRange,
      number_of_openings: Number(editingJob.openings) || 1,
      country: editingJob.country,
      state: editingJob.state,
      city: editingJob.city,
      minimum_education: editingJob.education,
      specialization: editingJob.specialization,
      deadline: editingJob.deadline || null,
      description: editingJob.overview.trim(),
      responsibilities: editingJob.responsibilities
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      location: editingJob.location,
      jd_file_url: editingJob.jd_file_url,
      salary_min_lpa: toNumber(editingJob.salary_min_lpa),
      salary_max_lpa: toNumber(editingJob.salary_max_lpa),
      experience_min_years: toNumber(editingJob.experience_min_years),
      experience_max_years: toNumber(editingJob.experience_max_years),
      questions: editingJob.questions,
      keywords: editingJob.keywords,
      application_deadline: editingJob.application_deadline,
      ...(editingJob.job_status && { job_status: editingJob.job_status }),
      ...(editingJob.status && { status: editingJob.status }),
    };

    updateMutation.mutate(
      { jobId: editingJob.id, payload },
      {
        onSuccess: () => {
          showSuccess(t("editJob.toasts.updated"));
          onClose();
        },
        onError: (err) => {
          const errorMsg =
            err?.response?.data?.message ||
            err?.message ||
            t("editJob.toasts.updateFailed");
          showError(errorMsg);
        },
      },
    );
  };

  return {
    currentStep,
    errors,
    isDirty,
    showConfirmDiscard,
    setShowConfirmDiscard,
    editingJob,
    setEditingJob,
    skillsList,
    skillInput,
    setSkillInput,
    industryOptions,
    selectedIndustry,
    salaryRange,
    experienceRange,
    set,
    setValue,
    markDirty,
    handleAddSkill,
    handleRemoveSkill,
    handleSkillKeyDown,
    handleCloseAttempt,
    nextStep,
    prevStep,
    handleStepClick,
    handleUpdate,
  };
}
