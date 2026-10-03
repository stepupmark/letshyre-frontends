import { useTranslation } from "react-i18next";
import { FIELD, FIELD_ERROR, FORM_GRID, FORM_GROUP } from "./onboardingFields";
import { BIcon } from "@/components/icons/BootstrapIcons";

function StepJobPreferencesCompanyDetails({
  register,
  errors,
  company,
  lwd,
  currentCtc,
  expectedCtc,
}) {
  const { t } = useTranslation("employeeOnboarding");

  return (
    <div className={FORM_GRID}>
      <div className={FORM_GROUP}>
        <label>
          {t("jobPreferences.companyDetails.companyLabel")}
          {company && !errors.present_or_last_working_company && (
            <BIcon name="check-circle-fill" className="ms-1.5 text-success" />
          )}
        </label>
        <input
          className={FIELD}
          placeholder={t("jobPreferences.companyDetails.companyPlaceholder")}
          {...register("present_or_last_working_company", {
            required: t("jobPreferences.companyDetails.companyRequired"),
          })}
        />
        {errors.present_or_last_working_company && (
          <p className={FIELD_ERROR}>
            {errors.present_or_last_working_company.message}
          </p>
        )}
      </div>

      <div className={FORM_GROUP}>
        <label>
          {t("jobPreferences.companyDetails.lastDayLabel")}
          {lwd && !errors.last_day_of_working && (
            <BIcon name="check-circle-fill" className="ms-1.5 text-success" />
          )}
        </label>
        <input
          type="date"
          className={FIELD}
          max="9999-12-31"
          {...register("last_day_of_working", {
            required: t("jobPreferences.companyDetails.lastDayRequired"),
          })}
        />
        {errors.last_day_of_working && (
          <p className={FIELD_ERROR}>{errors.last_day_of_working.message}</p>
        )}
      </div>

      <div className={FORM_GROUP}>
        <label>
          {t("jobPreferences.companyDetails.currentCtcLabel")}
          {currentCtc && !errors.current_ctc && (
            <BIcon name="check-circle-fill" className="ms-1.5 text-success" />
          )}
        </label>
        <input
          type="number"
          step="0.1"
          className={FIELD}
          placeholder={t("jobPreferences.companyDetails.currentCtcPlaceholder")}
          {...register("current_ctc", {
            required: t("jobPreferences.companyDetails.currentCtcRequired"),
          })}
        />
        {errors.current_ctc && (
          <p className={FIELD_ERROR}>{errors.current_ctc.message}</p>
        )}
      </div>

      <div className={FORM_GROUP}>
        <label>
          {t("jobPreferences.companyDetails.expectedCtcLabel")}
          {expectedCtc && !errors.expected_ctc && (
            <BIcon name="check-circle-fill" className="ms-1.5 text-success" />
          )}
        </label>
        <input
          type="number"
          step="0.1"
          className={FIELD}
          placeholder={t("jobPreferences.companyDetails.expectedCtcPlaceholder")}
          {...register("expected_ctc", {
            required: t("jobPreferences.companyDetails.expectedCtcRequired"),
            validate: (val) => {
              if (parseFloat(val) < parseFloat(currentCtc)) {
                return t("jobPreferences.companyDetails.expectedCtcTooLow");
              }
              return true;
            },
          })}
        />
        {errors.expected_ctc && (
          <p className={FIELD_ERROR}>{errors.expected_ctc.message}</p>
        )}
      </div>
    </div>
  );
}

export default StepJobPreferencesCompanyDetails;
