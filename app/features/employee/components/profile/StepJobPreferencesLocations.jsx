import { useTranslation } from "react-i18next";
import { FIELD, FIELD_ERROR, FORM_GROUP } from "./onboardingFields";
import { BIcon } from "@/components/icons/BootstrapIcons";

function StepJobPreferencesLocations({
  register,
  setValue,
  errors,
  preferred_locations,
}) {
  const { t } = useTranslation("employeeOnboarding");

  return (
    <div className={FORM_GROUP}>
      <label>
        {t("jobPreferences.locations.label")}
        {preferred_locations &&
          preferred_locations.length > 0 &&
          !errors.preferred_locations_string && (
            <BIcon name="check-circle-fill" className="ms-1.5 text-success" />
          )}
      </label>
      <input
        className={FIELD}
        placeholder={t("jobPreferences.locations.placeholder")}
        {...register("preferred_locations_string", {
          required: t("jobPreferences.locations.required"),
          onChange: (e) => {
            // Sync with the actual array field if needed, or we just parse it on submit
            const arr = e.target.value
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean);
            setValue("preferred_locations", arr);
          },
        })}
      />
      {errors.preferred_locations_string && (
        <p className={FIELD_ERROR}>
          {errors.preferred_locations_string.message}
        </p>
      )}
    </div>
  );
}

export default StepJobPreferencesLocations;
