import React, { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { CloudUpload } from "lucide-react";
import {
  useUploadResume,
  useCheckResumeStatus,
  useGetParsedResumeData,
  useGetSkillsForRole,
} from "@/features/employee/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ACTIONS,
  BTN_PRIMARY,
  BTN_SECONDARY,
  ERROR_MSG,
  FIELD,
  FIELD_LABEL,
  TEXTAREA,
} from "./onboardingFields";
import { BIcon } from "@/components/icons/BootstrapIcons";
import { ApiError } from "@/lib/apiErrorMessages";
import { resolveProfileErrorKey } from "./profileErrorMessages";

const ROLE_GRID = "mt-6 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4";

const ROLE_CARD =
  "cursor-pointer rounded-md border border-border bg-card p-3.5 text-center text-sm font-semibold text-text-body transition-all duration-200 hover:border-brand-600 hover:shadow-sm";

const ROLE_CARD_ACTIVE =
  "border-brand-600 bg-brand-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]";

const SECTION_HEADING = "mb-2 text-lg text-text-body";

const SECTION_SUB = "text-sm text-neutral-500";

function StepResume({ onNext, onBack }) {
  const { t } = useTranslation("employeeOnboarding");
  const { setValue, watch } = useFormContext();
  const fileRef = useRef(null);

  const uploadResumeMutation = useUploadResume();
  const checkStatusMutation = useCheckResumeStatus();
  const getParsedDataMutation = useGetParsedResumeData();
  const getSkillsMutation = useGetSkillsForRole();

  const file = watch("resume");
  const suggestedRoles = watch("suggested_roles") || [];
  const selectedRole = watch("selected_role");
  const parsedData = watch("parsed_resume_data");
  const roleOtherReason = watch("role_other_reason");
  const formRoleSkills = watch("role_skills") || [];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleSkills, setRoleSkills] = useState(formRoleSkills);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [clarificationRoles, setClarificationRoles] = useState([]);

  const [customRole, setCustomRole] = useState(() => {
    if (selectedRole && selectedRole !== "Other" && !suggestedRoles.includes(selectedRole)) {
      return selectedRole;
    }
    return "";
  });

  const isCustomRole = selectedRole === "Other" || suggestedRoles.length === 0 || (selectedRole && !suggestedRoles.includes(selectedRole));

  const processResume = async (selectedFile) => {
    setLoading(true);
    setError("");
    setValue("suggested_roles", []);

    try {
      const fd = new FormData();
      fd.append("resume", selectedFile);

      // STEP 1: UPLOAD
      const uploadRes = await uploadResumeMutation.mutateAsync(fd);
      const jobId = uploadRes?.data?.job_id;
      if (!jobId) throw new Error(t("resume.noJobId"));

      // STEP 2: POLL STATUS
      let attempts = 0;
      const maxAttempts = 15;
      let roles = [];
      let resumeId = "";

      while (attempts < maxAttempts) {
        await new Promise((res) => setTimeout(res, 2000));
        const statusData = await checkStatusMutation.mutateAsync(jobId);
        const jobStatus = statusData?.data?.status;

        if (jobStatus === "completed") {
          const result = statusData.data;
          resumeId = result.ai_resume_id;
          roles = (result?.suggested_roles?.suggested_roles || result?.suggested_roles?.roles || []).filter(Boolean);
          break;
        }

        if (jobStatus === "failed") {
          const key = resolveProfileErrorKey(
            { status: 200, backendMessage: statusData?.data?.error_message },
            { fallback: "resume.processingFailed" },
          );
          throw new Error(t(key));
        }
        attempts++;
      }

      if (attempts === maxAttempts) {
        throw new Error(t("resume.aiTimeout"));
      }

      // STEP 3: FETCH PARSED DATA
      const reviewJson = await getParsedDataMutation.mutateAsync(jobId);
      const parsedResume = reviewJson?.data?.data || {};

      // CLEAN ROLES
      const cleanedRoles = [...new Set(roles)].map((r) => r.trim()).filter(Boolean);

      if (!cleanedRoles.length) {
        setError(t("resume.noRolesDetected"));
      }

      // SET STATE
      setValue("resume", selectedFile);
      setValue("resume_id", resumeId);
      setValue("job_id", jobId);
      setValue("suggested_roles", cleanedRoles);
      setValue("parsed_resume_data", parsedResume);

      if (cleanedRoles.length > 0) {
        setValue("selected_role", cleanedRoles[0]);
        validateRole(cleanedRoles[0], parsedResume);
      }
    } catch (e) {
      console.error(e);
      const message = e instanceof ApiError
        ? t(resolveProfileErrorKey(e, { fallback: "resume.processingFailed" }))
        : e.message || t("resume.processingFailed");
      setError(message);
      setValue("resume", null);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowed.includes(selectedFile.type)) {
      setError(t("resume.fileTypeInvalid"));
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(t("jobPreferences.documents.errors.maxSize"));
      return;
    }

    setValue("resume", selectedFile); // Optimistic UI
    processResume(selectedFile);
  };

  const changeResume = () => {
    setValue("resume", null);
    setValue("resume_id", "");
    setValue("job_id", "");
    setValue("suggested_roles", []);
    setValue("selected_role", "");
    setValue("parsed_resume_data", null);
    setError("");
    setCustomRole("");
    setClarificationRoles([]);
    setRoleSkills([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const validateRole = async (role, dataContext = parsedData) => {
    if (!role || !dataContext) return;

    try {
      setRoleLoading(true);
      setError("");

      const data = await getSkillsMutation.mutateAsync(role);

      if (data?.data?.needs_clarification) {
        setClarificationRoles(data.data.suggestions || []);
        setRoleSkills([]);
        setError(`⚠️ ${t("resume.clarifyRole")}`);
        return;
      }

      setClarificationRoles([]);

      const skills = data?.data?.skills || [];
      setRoleSkills(skills);
      setValue("selected_role", role);
      setValue("role_skills", skills);
    } catch (e) {
      console.error(e);
      const message = e instanceof ApiError
        ? t(resolveProfileErrorKey(e, { fallback: "resume.roleValidationFailed" }))
        : e.message || t("resume.roleValidationFailed");
      setError(message);
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="pc-step-content">
        {!file && (
          <div
            className="cursor-pointer rounded-lg border-2 border-dashed border-neutral-300 bg-bg-subtle p-12 text-center transition-all duration-300 hover:border-brand-600 hover:bg-neutral-100"
            onClick={() => fileRef.current.click()}
          >
            <div className="mb-6 flex justify-center">
              <CloudUpload size={64} className="text-brand-600" strokeWidth={1.5} />
            </div>
            <h3 className={SECTION_HEADING}>{t("resume.uploadHeading")}</h3>
            <p className={cn(SECTION_SUB, "mb-6")}>
              {t("resume.uploadSub")}
            </p>
            <Button type="button" className={BTN_PRIMARY}>
              {t("resume.selectFile")}
            </Button>
          </div>
        )}
        {file && (
          <>
            <div className="mb-8 flex items-center justify-between rounded-lg border border-border bg-bg-subtle p-5">
              <div className="flex items-center gap-3 text-sm font-semibold text-text-body">
                <BIcon name="file-earmark-pdf" className="text-2xl text-danger" />
                {file.name}
              </div>
              <Button type="button" className={BTN_SECONDARY} onClick={changeResume}>
                {t("resume.changeFile")}
              </Button>
            </div>

            {loading ? (
              <div className="mt-8">
                <Skeleton className="mb-3 h-5.5 w-40 rounded-sm" />
                <Skeleton className="mb-7 h-3.5 w-1/2 rounded-sm" />

                <div className={ROLE_GRID}>
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>

                <div className="mt-10">
                  <Skeleton className="mb-4 h-4 w-55 rounded-sm" />
                  <div className="flex flex-wrap gap-2.5">
                    <Skeleton className="h-7 w-20 rounded-lg" />
                    <Skeleton className="h-7 w-30 rounded-lg" />
                    <Skeleton className="h-7 w-22.5 rounded-lg" />
                    <Skeleton className="h-7 w-27.5 rounded-lg" />
                  </div>
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {suggestedRoles.length > 0 ? (
                  <>
                    <h3 className={SECTION_HEADING}>
                      {error ? t("resume.refinedRoleSuggestions") : t("resume.selectYourRole")}
                    </h3>
                    <p className={SECTION_SUB}>
                      {t("resume.roleSuggestionSub")}
                    </p>

                    <div className={ROLE_GRID}>
                      {suggestedRoles.map((role, i) => (
                        <div
                          key={i}
                          className={cn(ROLE_CARD, selectedRole === role && ROLE_CARD_ACTIVE)}
                          onClick={() => {
                            setValue("selected_role", role);
                            setValue("role_other_reason", "");
                            setCustomRole("");
                            setClarificationRoles([]);
                            setRoleSkills([]);
                            validateRole(role);
                          }}
                        >
                          {role}
                        </div>
                      ))}
                      <div
                        className={cn(ROLE_CARD, isCustomRole && ROLE_CARD_ACTIVE)}
                        onClick={() => {
                          setValue("selected_role", "Other");
                          setRoleSkills([]);
                        }}
                      >
                        {t("resume.otherRole")}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={cn(ERROR_MSG, "mt-5")}>
                    ⚠️ {t("resume.noRolesDetectedBanner")}
                  </div>
                )}

                {isCustomRole && !loading && (
                  <div className="mt-6 rounded-md border border-border bg-bg-subtle p-4">
                    <div className="mb-4">
                      <label className={cn(FIELD_LABEL, "block")}>{t("resume.customRoleLabel")}</label>
                    <input
                      className={FIELD}
                      value={customRole}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomRole(value);
                        setRoleSkills([]);
                        setError("");

                        if (typingTimeout) clearTimeout(typingTimeout);

                        const timeout = setTimeout(() => {
                          if (value.trim().length > 0 && !value.endsWith(" ")) {
                            validateRole(value);
                          }
                        }, 800);

                        setTypingTimeout(timeout);
                      }}
                      placeholder={t("resume.customRolePlaceholder")}
                      disabled={roleLoading}
                    />
                    </div>

                    {clarificationRoles.length > 0 && (
                      <div className="mb-4">
                        <label className="mb-2 block text-xs text-neutral-500">
                          {t("resume.suggestedSpecificRoles")}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {clarificationRoles.map((role, i) => (
                            <Button
                              key={i}
                              type="button"
                              className={cn(BTN_SECONDARY, "rounded-lg bg-card px-3 py-1 text-xs")}
                              onClick={() => {
                                setCustomRole(role);
                                setClarificationRoles([]);
                                validateRole(role);
                              }}
                            >
                              {role}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className={cn(FIELD_LABEL, "block")}>
                        {t("resume.customRoleReasonLabel")}
                      </label>
                      <textarea
                        className={cn(TEXTAREA, "min-h-20")}
                        placeholder={t("resume.customRoleReasonPlaceholder")}
                        value={roleOtherReason}
                        onChange={(e) => setValue("role_other_reason", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {roleLoading ? (
                  <div className="mt-8">
                    <Skeleton className="mb-4 h-4 w-55 rounded-sm" />
                    <div className="flex flex-wrap gap-2.5">
                      <Skeleton className="h-7 w-17.5 rounded-lg" />
                      <Skeleton className="h-7 w-27.5 rounded-lg" />
                      <Skeleton className="h-7 w-22.5 rounded-lg" />
                      <Skeleton className="h-7 w-32.5 rounded-lg" />
                      <Skeleton className="h-7 w-21.25 rounded-lg" />
                    </div>
                  </div>
                ) : roleSkills.length > 0 && (
                  <div className="mt-8">
                    <h4 className="mb-3 text-sm text-text-body">
                      {t("resume.suggestedSkillsFor", { role: selectedRole })}
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {roleSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="inline-block rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-semibold text-brand-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}

        {error && !loading && (
          <div className={cn(ERROR_MSG, "mt-6")}>{error}</div>
        )}

        <input
          hidden
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <div className={ACTIONS}>
          <Button type="button" className={BTN_SECONDARY} onClick={onBack}>
            <BIcon name="arrow-left" /> {t("back")}
          </Button>
          {file && !loading && selectedRole && !roleLoading && (
            <Button
              type="button"
              className={BTN_PRIMARY}
              onClick={() => {
                if (isCustomRole) {
                  if (!customRole || customRole.trim() === "") {
                    setError(t("resume.customRoleRequired"));
                    return;
                  }
                  if (!roleOtherReason || roleOtherReason.trim() === "") {
                    setError(t("resume.customRoleReasonRequired"));
                    return;
                  }
                  setValue("selected_role", customRole.trim());
                }
                onNext();
              }}
            >
              {t("continue")} <BIcon name="arrow-right" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default StepResume;
