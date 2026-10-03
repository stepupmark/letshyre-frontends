import { useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useIndustries } from "@/hooks/useIndustries";
import { Button } from "@/components/ui/button";
import { ACTIONS, BTN_PRIMARY, BTN_SECONDARY, FORM_GROUP } from "./onboardingFields";
import { BIcon } from "@/components/icons/BootstrapIcons";
import { getIndustryOptions } from "./industryOptions";
import { handleDocumentFile, handleViewDocumentFile } from "./jobPreferenceFileUpload";
import StepJobPreferencesCompanyDetails from "./StepJobPreferencesCompanyDetails";
import StepJobPreferencesIndustry from "./StepJobPreferencesIndustry";
import StepJobPreferencesLocations from "./StepJobPreferencesLocations";
import StepJobPreferencesMandatoryDocuments from "./StepJobPreferencesMandatoryDocuments";
import StepJobPreferencesOptionalDocuments from "./StepJobPreferencesOptionalDocuments";

function StepJobPreferences({ onNext, onBack }) {
  const { t } = useTranslation("employeeOnboarding");
  const {
    register,
    control,
    setValue,
    watch,
    trigger,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const resignationRef = useRef(null);
  const experienceRef = useRef(null);
  const offerRef = useRef(null);
  const noticeProofRef = useRef(null);

  const { data: industryData, isLoading: loadingIndustries } =
    useIndustries();
  const allIndustries = getIndustryOptions(industryData);

  const [industryOpen, setIndustryOpen] = useState(false);
  const [industrySearch, setIndustrySearch] = useState(
    watch("preferred_industry") || "",
  );

  const preferred_industry = watch("preferred_industry");
  const preferred_locations = watch("preferred_locations");

  // Watch files for display
  const resignationLetter = watch("resignation_letter");
  const experienceLetter = watch("experience_letter");
  const presentOffer = watch("present_offer");
  const noticePeriodProofType = watch("notice_period_proof_type");
  const noticePeriodProof = watch("notice_period_proof");
  const currentCtc = watch("current_ctc");
  const expectedCtc = watch("expected_ctc");
  const company = watch("present_or_last_working_company");
  const lwd = watch("last_day_of_working");

  const handleFile = (e, type) =>
    handleDocumentFile(e, type, { setValue, setError, clearErrors, t });

  const handleViewFile = handleViewDocumentFile;

  const handleNextClick = async () => {
    // Industry must be an exact match from the list, or it fails validation.
    const trimmedSearch = industrySearch?.trim() || "";
    const exactMatch = allIndustries.find(
      (ind) => ind.toLowerCase() === trimmedSearch.toLowerCase()
    );

    if (exactMatch) {
      setValue("preferred_industry", exactMatch);
    } else {
      setValue("preferred_industry", "", { shouldValidate: true });
    }

    const isValid = await trigger([
      "present_or_last_working_company",
      "last_day_of_working",
      "current_ctc",
      "expected_ctc",
      "preferred_industry",
      "preferred_locations_string", // We will use a string field and convert to array
      "notice_period_proof_type",
    ]);

    let hasFileError = false;
    const resignation = watch("resignation_letter");
    const experience = watch("experience_letter");
    const noticeProof = watch("notice_period_proof");

    if (!resignation) {
      setError("resignation_letter", { message: t("jobPreferences.documents.resignation.required") });
      hasFileError = true;
    } else {
      clearErrors("resignation_letter");
    }

    if (!experience) {
      setError("experience_letter", { message: t("jobPreferences.documents.experience.required") });
      hasFileError = true;
    } else {
      clearErrors("experience_letter");
    }

    if (!noticeProof) {
      setError("notice_period_proof", { message: t("jobPreferences.documents.noticeProof.fileRequired") });
      hasFileError = true;
    } else {
      clearErrors("notice_period_proof");
    }

    if (errors.present_offer) {
      hasFileError = true;
    }

    if (!isValid || hasFileError) return;

    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >

      <StepJobPreferencesCompanyDetails
        register={register}
        errors={errors}
        company={company}
        lwd={lwd}
        currentCtc={currentCtc}
        expectedCtc={expectedCtc}
      />

      <StepJobPreferencesIndustry
        register={register}
        setValue={setValue}
        errors={errors}
        preferred_industry={preferred_industry}
        industrySearch={industrySearch}
        setIndustrySearch={setIndustrySearch}
        industryOpen={industryOpen}
        setIndustryOpen={setIndustryOpen}
        allIndustries={allIndustries}
        loadingIndustries={loadingIndustries}
      />

      <StepJobPreferencesLocations
        register={register}
        setValue={setValue}
        errors={errors}
        preferred_locations={preferred_locations}
      />

      <div className={FORM_GROUP}>
        <label>{t("jobPreferences.mandatoryDocumentsLabel")}</label>
        <StepJobPreferencesMandatoryDocuments
          control={control}
          errors={errors}
          handleFile={handleFile}
          handleViewFile={handleViewFile}
          setValue={setValue}
          resignationLetter={resignationLetter}
          experienceLetter={experienceLetter}
          noticePeriodProofType={noticePeriodProofType}
          noticePeriodProof={noticePeriodProof}
          resignationRef={resignationRef}
          experienceRef={experienceRef}
          noticeProofRef={noticeProofRef}
        />

        <StepJobPreferencesOptionalDocuments
          errors={errors}
          handleFile={handleFile}
          handleViewFile={handleViewFile}
          setValue={setValue}
          clearErrors={clearErrors}
          presentOffer={presentOffer}
          offerRef={offerRef}
        />
      </div>

      <div className={ACTIONS}>
        <Button type="button" className={BTN_SECONDARY} onClick={onBack}>
          <BIcon name="arrow-left" /> {t("back")}
        </Button>
        <Button type="button" className={BTN_PRIMARY} onClick={handleNextClick}>
          {t("continue")} <BIcon name="arrow-right" />
        </Button>
      </div>
    </motion.div>
  );
}

export default StepJobPreferences;
