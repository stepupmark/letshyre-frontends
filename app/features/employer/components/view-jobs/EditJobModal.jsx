import { useTranslation } from "react-i18next";
import { useUpdateJob } from "@/features/employer/hooks/useJobMutations";
import { useIndustries } from "@/hooks/useIndustries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEditJobForm } from "@/features/employer/components/view-jobs/useEditJobForm";
import { EditJobModalProgress } from "@/features/employer/components/view-jobs/EditJobModalProgress";
import { EditJobModalFooter } from "@/features/employer/components/view-jobs/EditJobModalFooter";
import { EditJobModalStep1 } from "@/features/employer/components/view-jobs/EditJobModalStep1";
import { EditJobModalStep2 } from "@/features/employer/components/view-jobs/EditJobModalStep2";
import { EditJobModalStep3 } from "@/features/employer/components/view-jobs/EditJobModalStep3";

// `key` resolves the step label from the catalog at render time.
const STEPS = [
  { id: 1, key: "basicInfo" },
  { id: 2, key: "compensation" },
  { id: 3, key: "descriptionReq" },
];

/**
 * Responsive multi-step EditJobModal with wizard navigation (Step 1 -> Step 2 -> Step 3),
 * interactive skills chip tags, step-by-step validation, and unsaved changes protection.
 */
export const EditJobModal = ({ job, onClose }) => {
  const { t } = useTranslation("employerJobs");
  const updateMutation = useUpdateJob();
  const { data: rawIndustries = [], isLoading: industriesLoading } =
    useIndustries();

  const {
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
  } = useEditJobForm({ job, onClose, updateMutation, rawIndustries, t });

  return (
    <Dialog open onOpenChange={(open) => !open && handleCloseAttempt()}>
      <DialogContent className="flex flex-col max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4 sm:px-6">
          <DialogTitle className="text-lg sm:text-xl">
            {t("editJob.title")}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {t("editJob.description")}
          </DialogDescription>
        </DialogHeader>

        <EditJobModalProgress
          t={t}
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        {/* Step Body (Scrollable content area with min-h-0 so footer NEVER gets pushed off screen) */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6">
          {currentStep === 1 && (
            <EditJobModalStep1
              t={t}
              errors={errors}
              editingJob={editingJob}
              set={set}
              setValue={setValue}
              industryOptions={industryOptions}
              industriesLoading={industriesLoading}
              selectedIndustry={selectedIndustry}
              skillInput={skillInput}
              setSkillInput={setSkillInput}
              handleSkillKeyDown={handleSkillKeyDown}
              handleAddSkill={handleAddSkill}
              skillsList={skillsList}
              handleRemoveSkill={handleRemoveSkill}
            />
          )}

          {currentStep === 2 && (
            <EditJobModalStep2
              t={t}
              errors={errors}
              editingJob={editingJob}
              set={set}
              salaryRange={salaryRange}
              experienceRange={experienceRange}
            />
          )}

          {currentStep === 3 && (
            <EditJobModalStep3
              t={t}
              errors={errors}
              editingJob={editingJob}
              set={set}
              markDirty={markDirty}
              setEditingJob={setEditingJob}
            />
          )}
        </div>

        <EditJobModalFooter
          t={t}
          steps={STEPS}
          currentStep={currentStep}
          isDirty={isDirty}
          showConfirmDiscard={showConfirmDiscard}
          setShowConfirmDiscard={setShowConfirmDiscard}
          onClose={onClose}
          handleCloseAttempt={handleCloseAttempt}
          prevStep={prevStep}
          nextStep={nextStep}
          handleUpdate={handleUpdate}
          isUpdatePending={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};
