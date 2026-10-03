import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "@/lib/toast";
import { User } from "lucide-react";
import { useSubmitProfile } from "@/features/employee/hooks/useProfile";
import { useEmployeeProfileStore } from "@/features/employee/store/employeeProfile.store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getStoredUser, clearStoredUser } from "@/lib/getUser";
import { ACTIONS, BTN_PRIMARY, BTN_SECONDARY, ERROR_MSG } from "./onboardingFields";
import { BIcon } from "@/components/icons/BootstrapIcons";
import { resolveProfileErrorKey, FIELD_TO_STEP, FIELD_ERROR_KEYS } from "./profileErrorMessages";

// The backend's field names don't all match the RHF field names — the array
// field's visible input is the comma-separated string, and the notice-period
// fields drop one "o" on the wire (see the real submitProfile payload below:
// notice_period_prof_type / notice_period_prof).
const SET_ERROR_FIELD_OVERRIDES = {
  preferred_locations: "preferred_locations_string",
  notice_period_prof_type: "notice_period_proof_type",
  notice_period_prof: "notice_period_proof",
};

const OVERLAY =
  "fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white/90";

const SPINNER =
  "size-13.5 animate-[spin_0.8s_cubic-bezier(0.4,0,0.2,1)_infinite] rounded-full border-4 border-border border-t-brand-600 shadow-[0_0_20px_rgba(0,0,0,0.05)] motion-reduce:animate-none";

const SECTION =
  "rounded-lg border border-border bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0";

const SECTION_HEAD =
  "mb-3 flex items-center gap-2.5 rounded-sm border-s-4 border-brand-600 bg-brand-100 px-4 py-3 text-base font-bold text-brand-600";

const INFO_ITEM = "rounded-md bg-bg-subtle p-4";

const INFO_LABEL =
  "mb-1 text-xs font-semibold tracking-[0.5px] text-neutral-500 uppercase";

const INFO_VALUE = "text-base font-semibold text-text-body";

const BADGE_BASE = "rounded-lg px-3.5 py-1.5 text-sm font-semibold";

const LIST_CARD = "mb-3 rounded-md border border-border bg-bg-subtle p-4 last:mb-0";

const AVATAR =
  "mx-auto mb-4 block size-30 rounded-full border-4 border-bg-subtle object-cover object-top shadow-[0_4px_12px_rgba(0,0,0,0.1)]";

function StepReview({ onBack, onFinish }) {
  const { t } = useTranslation("employeeOnboarding");
  const navigate = useNavigate();
  const { getValues, setError } = useFormContext();
  const submitProfileMutation = useSubmitProfile();

  const [submitError, setSubmitError] = useState("");
  const [photoSrc, setPhotoSrc] = useState(null);

  const profileData = getValues();
  const user = getStoredUser();

  const company = profileData.present_or_last_working_company || "-";
  const lastWorking = profileData.last_day_of_working || "-";
  const currentCtc = profileData.current_ctc || "-";
  const expectedCtc = profileData.expected_ctc || "-";
  const industry = profileData.preferred_industry || "-";
  const locations = Array.isArray(profileData.preferred_locations)
    ? profileData.preferred_locations.join(", ")
    : profileData.preferred_locations || "-";
  const gender = profileData.gender || "-";
  const dob = profileData.dob || "-";
  const location = profileData.location || "-";
  const profilePhoto = profileData.profile_photo || null;

  const finalRoles = profileData.selected_role
    ? [profileData.selected_role]
    : profileData.suggested_roles?.length
      ? profileData.suggested_roles
      : [];

  const parsed = profileData.parsed_resume_data;
  const finalParsed = parsed?.data || parsed || {};

  const resumeReview = {
    skills: finalParsed.skills || [],
    certifications: finalParsed.certifications || [],
    education: finalParsed.education || [],
    projects: finalParsed.projects || [],
    experience: finalParsed.experience || [],
    total_experience: finalParsed.total_experience || "",
    role_wise_experience: finalParsed.role_wise_experience || [],
  };

  useEffect(() => {
    if (!profilePhoto) return;
    if (typeof profilePhoto === "string") {
      // Mirrors the object-URL branch below — kept in the effect so both
      // paths update photoSrc through the same synchronization point.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhotoSrc(profilePhoto);
      return;
    }
    const objectUrl = URL.createObjectURL(profilePhoto);
    setPhotoSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePhoto]);

  const handleSubmit = async () => {
    setSubmitError("");

    try {
      const fd = new FormData();

      // IDENTITY
      fd.append("gender", profileData.gender || "");
      fd.append("dob", profileData.dob || "");

      const cleanAadhaar = (profileData.aadhar_number || "").replace(/\D/g, "");
      fd.append("aadhar_number", cleanAadhaar);
      fd.append("location", profileData.location || "");
      fd.append("address", profileData.address || "");

      if (
        profileData.profile_photo &&
        typeof profileData.profile_photo !== "string"
      ) {
        fd.append(
          "profile_photo",
          profileData.profile_photo,
          profileData.profile_photo.name || "profile_photo.png",
        );
      }

      // JOB DETAILS
      fd.append(
        "present_or_last_working_company",
        profileData.present_or_last_working_company || "",
      );
      fd.append("last_day_of_working", profileData.last_day_of_working || "");
      fd.append("current_ctc", profileData.current_ctc || "");
      fd.append("expected_ctc", profileData.expected_ctc || "");
      fd.append("preferred_industry", profileData.preferred_industry || "");
      fd.append(
        "preferred_locations",
        JSON.stringify(profileData.preferred_locations || []),
      );

      if (profileData.resignation_letter)
        fd.append("resignation_letter", profileData.resignation_letter);
      if (profileData.experience_letter)
        fd.append("experience_letter", profileData.experience_letter);
      if (profileData.present_offer)
        fd.append("present_offer", profileData.present_offer);
      fd.append(
        "notice_period_prof_type",
        profileData.notice_period_proof_type || "",
      );
      if (profileData.notice_period_proof)
        fd.append("notice_period_prof", profileData.notice_period_proof);

      // RESUME & ROLE
      if (profileData.resume) fd.append("resume", profileData.resume);
      fd.append("resume_id", profileData.resume_id || "");
      fd.append("role", profileData.selected_role || "");
      fd.append("selected_role", profileData.selected_role || "");
      fd.append("role_other_reason", profileData.role_other_reason || "");

      // PARSED DATA
      fd.append("parsed_resume_data", JSON.stringify(resumeReview || {}));
      fd.append("education", JSON.stringify(resumeReview.education || []));
      fd.append("experience", JSON.stringify(resumeReview.experience || []));
      fd.append("projects", JSON.stringify(resumeReview.projects || []));
      fd.append(
        "certifications",
        JSON.stringify(resumeReview.certifications || []),
      );

      // Calculate Total Exp
      let totalExpYears = 0;
      (resumeReview.experience || []).forEach((exp) => {
        if (!exp?.duration) return;
        const yearMatch = exp.duration.match(/(\d+)\s*year/);
        const monthMatch = exp.duration.match(/(\d+)\s*month/);
        const years = yearMatch ? parseInt(yearMatch[1]) : 0;
        const months = monthMatch ? parseInt(monthMatch[1]) : 0;
        totalExpYears += years + months / 12;
      });
      fd.append("total_experience_years", totalExpYears.toFixed(1));

      // Role-wise Exp
      const techExp = {};
      (resumeReview.experience || []).forEach((exp) => {
        if (!exp?.role) return;
        if (!techExp[exp.role]) techExp[exp.role] = 0;
        techExp[exp.role] += 1;
      });
      fd.append("tech_experience", JSON.stringify(techExp));

      fd.append("profile_completion_score", "100");
      fd.append("is_profile_complete", true);

      await submitProfileMutation.mutateAsync(fd);
      onFinish();
    } catch (e) {
      console.error(e);

      if (e.status === 401) {
        clearStoredUser();
        toast.error(t("errors.sessionExpired"));
        navigate("/employee/sign-in", { replace: true });
        return;
      }

      const fieldErrors = e.fieldErrors;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        let targetStep = null;

        for (const [field, message] of Object.entries(fieldErrors)) {
          const key = FIELD_ERROR_KEYS[field] ?? resolveProfileErrorKey(
            { status: e.status, backendMessage: message },
            { fallback: "errors.genericField" },
          );
          const rhfField = SET_ERROR_FIELD_OVERRIDES[field] ?? field;
          setError(rhfField, { message: t(key) });

          const step = FIELD_TO_STEP[field];
          if (step && (targetStep === null || step < targetStep)) targetStep = step;
        }

        if (targetStep && targetStep < 5) {
          useEmployeeProfileStore.getState().setStep(targetStep);
          toast.error(t("toast.jumpedToStep", { step: targetStep }));
        } else {
          toast.error(t("errors.validationFailed"));
        }
        return;
      }

      setSubmitError(t(resolveProfileErrorKey(e, { fallback: "errors.submitFailed" })));
    }
  };

  const isPending = submitProfileMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >

      {isPending &&
        createPortal(
          <div className={OVERLAY}>
            <div className={SPINNER}></div>
            <h2 className="mt-6 text-xl font-bold tracking-[-0.3px] text-text-body">
              {t("review.submitting")}
            </h2>
            <p className="mt-2 text-base font-medium text-neutral-500">
              {t("review.pleaseWait")}
            </p>
          </div>,
          document.body,
        )}

      <div className="grid grid-cols-[280px_1fr] items-start gap-6 max-lg:grid-cols-1">
        <div className="h-fit rounded-lg border border-border bg-card px-6 py-8 text-center shadow-sm">
          {photoSrc ? (
            <img src={photoSrc} className={AVATAR} alt={t("review.candidateAlt")} loading="lazy" decoding="async" />
          ) : (
            <div className={cn(AVATAR, "inline-flex items-center justify-center bg-neutral-100")}>
              <User size={48} className="text-neutral-400" />
            </div>
          )}
          <div className="mb-2 text-xl font-bold text-text-body">
            {user?.name || t("review.candidateFallback")}
          </div>
          <div className="text-sm leading-[1.8] text-neutral-500 [&_p]:m-0">
            <p>
              {gender} • {dob}
            </p>
            <p>{location}</p>
            {profileData.aadhar_number && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-success-bg px-3 py-1 text-xs font-semibold text-success">
                <BIcon name="shield-check" /> {t("review.aadhaarVerified")}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className={SECTION}>
            <h4 className={SECTION_HEAD}>
              <BIcon name="briefcase" /> {t("review.jobPreferencesHeading")}
            </h4>
            <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
              <div className={INFO_ITEM}>
                <div className={INFO_LABEL}>{t("review.currentCompany")}</div>
                <div className={INFO_VALUE}>{company}</div>
              </div>
              <div className={INFO_ITEM}>
                <div className={INFO_LABEL}>{t("review.lastWorkingDay")}</div>
                <div className={INFO_VALUE}>{lastWorking}</div>
              </div>
              <div className={INFO_ITEM}>
                <div className={INFO_LABEL}>{t("review.currentCtc")}</div>
                <div className={INFO_VALUE}>
                  {currentCtc !== "-" ? t("review.ctcValue", { value: currentCtc }) : "-"}
                </div>
              </div>
              <div className={INFO_ITEM}>
                <div className={INFO_LABEL}>{t("review.expectedCtc")}</div>
                <div className={INFO_VALUE}>
                  {expectedCtc !== "-" ? t("review.ctcValue", { value: expectedCtc }) : "-"}
                </div>
              </div>
              <div className={INFO_ITEM}>
                <div className={INFO_LABEL}>{t("review.industry")}</div>
                <div className={INFO_VALUE}>{industry}</div>
              </div>
              <div className={INFO_ITEM}>
                <div className={INFO_LABEL}>{t("review.locations")}</div>
                <div className={INFO_VALUE}>{locations}</div>
              </div>
            </div>
          </div>

          <div className={SECTION}>
            <h4 className={SECTION_HEAD}>
              <BIcon name="person-badge" /> {t("review.selectedRoles")}
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {finalRoles.map((r, i) => (
                <span key={i} className={cn(BADGE_BASE, "bg-brand-600 text-white")}>
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className={SECTION}>
            <h4 className={SECTION_HEAD}>
              <BIcon name="lightning" /> {t("review.topSkills")}
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {resumeReview.skills.length > 0 ? (
                resumeReview.skills.map((s, i) => (
                  <span
                    key={i}
                    className={cn(BADGE_BASE, "border border-border bg-neutral-100 text-neutral-700")}
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className={cn(INFO_VALUE, "font-normal")}>
                  {t("review.noSkills")}
                </span>
              )}
            </div>
          </div>

          <div className={SECTION}>
            <h4 className={SECTION_HEAD}>
              <BIcon name="journal-check" /> {t("review.experienceHeading")}
            </h4>
            {resumeReview.experience.length === 0 ? (
              <div className={LIST_CARD}>{t("review.noExperience")}</div>
            ) : (
              resumeReview.experience.map((e, i) => (
                <div key={i} className={LIST_CARD}>
                  {typeof e === "string" ? (
                    e
                  ) : (
                    <>
                      <div className="text-base font-bold text-text-body">{e.role}</div>
                      <div className="my-1 text-sm font-semibold text-brand-600">
                        {e.company} • {e.duration}
                      </div>
                      <div className="mt-2 text-sm leading-normal text-neutral-500">
                        {Array.isArray(e.description)
                          ? e.description.join(" ")
                          : e.description}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          <div className={SECTION}>
            <h4 className={SECTION_HEAD}>
              <BIcon name="mortarboard" /> {t("review.educationHeading")}
            </h4>
            {resumeReview.education.length === 0 ? (
              <div className={LIST_CARD}>{t("review.noEducation")}</div>
            ) : (
              resumeReview.education.map((e, i) => (
                <div key={i} className={LIST_CARD}>
                  {typeof e === "string" ? (
                    e
                  ) : (
                    <>
                      <div className="text-base font-bold text-text-body">
                        {e.degree || t("review.notAvailable")}
                      </div>
                      <div className="my-1 text-sm font-semibold text-brand-600">
                        {e.institution || t("review.notAvailable")}
                      </div>
                      <div className="text-sm leading-normal text-neutral-500">
                        {e.duration || ""}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {submitError && <div className={ERROR_MSG}>{submitError}</div>}

          <div className={ACTIONS}>
            <Button
              type="button"
              className={BTN_SECONDARY}
              onClick={onBack}
              disabled={isPending}
            >
              <BIcon name="arrow-left" /> {t("review.backToEdit")}
            </Button>
            <Button
              className={BTN_PRIMARY}
              onClick={handleSubmit}
              disabled={isPending}
            >
              {t("review.confirmSubmit")} <BIcon name="check-circle" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default StepReview;
