import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/features/employer/components/view-jobs/EditJobModalField";

export function EditJobModalStep3({
  t,
  errors,
  editingJob,
  set,
  markDirty,
  setEditingJob,
}) {
  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Field label={t("editJob.fields.education")} id="edit-education">
          <Input
            id="edit-education"
            placeholder={t("editJob.fields.educationPlaceholder")}
            value={editingJob.education}
            onChange={set("education")}
          />
        </Field>

        <Field label={t("editJob.fields.specialization")} id="edit-specialization">
          <Input
            id="edit-specialization"
            placeholder={t("editJob.fields.specializationPlaceholder")}
            value={editingJob.specialization}
            onChange={set("specialization")}
          />
        </Field>

        <Field
          label={t("editJob.fields.deadline")}
          id="edit-deadline"
          error={errors.deadline}
        >
          <Input
            id="edit-deadline"
            type="date"
            // en-CA formats as YYYY-MM-DD, in the user's own timezone.
            min={new Date().toLocaleDateString("en-CA")}
            value={
              editingJob.application_deadline ||
              editingJob.deadline ||
              ""
            }
            onChange={(e) => {
              markDirty();
              setEditingJob((prev) => ({
                ...prev,
                application_deadline: e.target.value,
                deadline: e.target.value,
              }));
            }}
            aria-invalid={!!errors.deadline}
          />
        </Field>
      </div>

      <Field
        label={t("editJob.fields.overview")}
        id="edit-overview"
        required
        error={errors.overview}
      >
        <Textarea
          id="edit-overview"
          rows={4}
          placeholder={t("editJob.fields.overviewPlaceholder")}
          value={editingJob.overview}
          onChange={set("overview")}
          aria-invalid={!!errors.overview}
        />
      </Field>

      <Field
        label={t("editJob.fields.responsibilities")}
        id="edit-responsibilities"
        helperText={t("editJob.fields.responsibilitiesHelper")}
      >
        <Textarea
          id="edit-responsibilities"
          rows={5}
          placeholder={t("editJob.fields.responsibilitiesPlaceholder")}
          value={editingJob.responsibilities}
          onChange={set("responsibilities")}
        />
      </Field>
    </div>
  );
}
