import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormSelect } from "@/components/common/FormSelect";
import { Field } from "@/features/employer/components/view-jobs/EditJobModalField";

export function EditJobModalStep1({
  t,
  errors,
  editingJob,
  set,
  setValue,
  industryOptions,
  industriesLoading,
  selectedIndustry,
  skillInput,
  setSkillInput,
  handleSkillKeyDown,
  handleAddSkill,
  skillsList,
  handleRemoveSkill,
}) {
  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      <Field
        label={t("editJob.fields.jobTitle")}
        id="edit-title"
        required
        error={errors.title}
      >
        <Input
          id="edit-title"
          placeholder={t("editJob.fields.jobTitlePlaceholder")}
          value={editingJob.title}
          onChange={set("title")}
          aria-invalid={!!errors.title}
          aria-required="true"
        />
      </Field>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Field label={t("editJob.fields.workType")} id="edit-work-type">
          <FormSelect
            triggerId="edit-work-type"
            value={editingJob.work_type}
            onValueChange={setValue("work_type")}
            placeholder={t("editJob.fields.selectWorkType")}
            options={[
              { value: "on_site", label: t("format.workMode.onSite") },
              { value: "remote", label: t("format.workMode.remote") },
              { value: "hybrid", label: t("format.workMode.hybrid") },
            ]}
          />
        </Field>

        <Field label={t("editJob.fields.employmentType")} id="edit-employment-type">
          <FormSelect
            triggerId="edit-employment-type"
            value={editingJob.employment_type}
            onValueChange={setValue("employment_type")}
            placeholder={t("editJob.fields.selectEmploymentType")}
            options={[
              { value: "full_time", label: t("postJob.form.employmentTypes.fullTime") },
              { value: "part_time", label: t("postJob.form.employmentTypes.partTime") },
              { value: "contract", label: t("postJob.form.employmentTypes.contract") },
            ]}
          />
        </Field>
      </div>

      <Field label={t("editJob.fields.industry")} id="edit-industry">
        <FormSelect
          triggerId="edit-industry"
          value={selectedIndustry}
          onValueChange={setValue("industry")}
          disabled={industriesLoading}
          placeholder={
            industriesLoading
              ? t("editJob.fields.loadingIndustries")
              : t("editJob.fields.selectIndustry")
          }
          options={industryOptions}
        />
      </Field>

      <Field
        label={t("editJob.fields.mustHaveSkills")}
        id="edit-skills-input"
        helperText={t("editJob.fields.skillsHelper")}
      >
        <div className="flex gap-2">
          <Input
            id="edit-skills-input"
            placeholder={t("editJob.fields.skillsPlaceholder")}
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleAddSkill()}
            className="shrink-0 gap-1"
          >
            <Plus className="size-4" />
            {t("editJob.fields.add")}
          </Button>
        </div>

        {skillsList.length > 0 && (
          <div className="mt-2 flex max-h-36 overflow-y-auto flex-wrap gap-1.5 rounded-lg border border-border bg-bg-subtle/50 p-3">
            {skillsList.map((skill, idx) => (
              <Badge
                key={`${skill}-${idx}`}
                variant="secondary"
                className="gap-1.5 ps-2.5 pe-1.5 py-1 text-xs sm:text-sm font-normal"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(idx)}
                  className="rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive focus:outline-none"
                  aria-label={t("editJob.fields.removeSkill", { skill })}
                >
                  <X className="size-3.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </Field>
    </div>
  );
}
