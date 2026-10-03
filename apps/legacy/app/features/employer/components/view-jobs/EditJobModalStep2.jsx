import { Input } from "@/components/ui/input";
import { Field } from "@/features/employer/components/view-jobs/EditJobModalField";

// A number input accepts these, but they only produce values we can't save.
const blockNonNumeric = (e) => {
  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
};

function RangeGroup({ legend, preview, children }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3 rounded-lg border border-border p-4">
      <legend className="px-1 text-sm font-semibold text-text-main">{legend}</legend>
      <div className="grid grid-cols-2 gap-3">{children}</div>
      <p className="m-0 text-xs text-text-muted" aria-live="polite">
        {preview}
      </p>
    </fieldset>
  );
}

function NumberField({ id, label, placeholder, value, onChange, error, step, inputMode }) {
  return (
    <Field label={label} id={id} error={error}>
      <Input
        id={id}
        type="number"
        min={0}
        step={step}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={blockNonNumeric}
      />
    </Field>
  );
}

export function EditJobModalStep2({ t, errors, editingJob, set, salaryRange, experienceRange }) {
  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <RangeGroup
          legend={t("editJob.fields.salary")}
          preview={t("editJob.fields.candidatesSee", {
            value: salaryRange || t("format.notDisclosed"),
          })}
        >
          <NumberField
            id="edit-salary-min"
            label={t("editJob.fields.minimum")}
            placeholder={t("editJob.fields.salaryMinPlaceholder")}
            step="0.5"
            inputMode="decimal"
            value={editingJob.salary_min_lpa}
            onChange={set("salary_min_lpa")}
            error={errors.salary_min_lpa}
          />
          <NumberField
            id="edit-salary-max"
            label={t("editJob.fields.maximum")}
            placeholder={t("editJob.fields.salaryMaxPlaceholder")}
            step="0.5"
            inputMode="decimal"
            value={editingJob.salary_max_lpa}
            onChange={set("salary_max_lpa")}
            error={errors.salary_max_lpa}
          />
        </RangeGroup>

        <RangeGroup
          legend={t("editJob.fields.experience")}
          preview={t("editJob.fields.candidatesSee", {
            value: experienceRange || t("format.notSpecified"),
          })}
        >
          <NumberField
            id="edit-exp-min"
            label={t("editJob.fields.minimum")}
            placeholder={t("editJob.fields.expMinPlaceholder")}
            step="1"
            inputMode="numeric"
            value={editingJob.experience_min_years}
            onChange={set("experience_min_years")}
            error={errors.experience_min_years}
          />
          <NumberField
            id="edit-exp-max"
            label={t("editJob.fields.maximum")}
            placeholder={t("editJob.fields.expMaxPlaceholder")}
            step="1"
            inputMode="numeric"
            value={editingJob.experience_max_years}
            onChange={set("experience_max_years")}
            error={errors.experience_max_years}
          />
        </RangeGroup>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Field
          label={t("editJob.fields.openings")}
          id="edit-openings"
          required
          error={errors.openings}
        >
          <Input
            id="edit-openings"
            type="number"
            min={1}
            inputMode="numeric"
            value={editingJob.openings}
            onChange={set("openings")}
            onKeyDown={blockNonNumeric}
          />
        </Field>

        <Field
          label={t("editJob.fields.location")}
          id="edit-location"
          helperText={t("editJob.fields.locationHelper")}
        >
          <Input
            id="edit-location"
            placeholder={t("editJob.fields.locationPlaceholder")}
            value={editingJob.location}
            onChange={set("location")}
          />
        </Field>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Field label={t("editJob.fields.country")} id="edit-country">
          <Input
            id="edit-country"
            placeholder={t("editJob.fields.countryPlaceholder")}
            value={editingJob.country}
            onChange={set("country")}
          />
        </Field>

        <Field label={t("editJob.fields.state")} id="edit-state">
          <Input
            id="edit-state"
            placeholder={t("editJob.fields.statePlaceholder")}
            value={editingJob.state}
            onChange={set("state")}
          />
        </Field>

        <Field label={t("editJob.fields.city")} id="edit-city">
          <Input
            id="edit-city"
            placeholder={t("editJob.fields.cityPlaceholder")}
            value={editingJob.city}
            onChange={set("city")}
          />
        </Field>
      </div>
    </div>
  );
}
