import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { FIELD, FIELD_ERROR, FORM_GROUP } from "./onboardingFields";
import { BIcon } from "@/components/icons/BootstrapIcons";

const INDUSTRY_DROPDOWN =
  "absolute top-full end-0 start-0 z-50 mt-1 max-h-62.5 overflow-y-auto rounded-md border border-border bg-card shadow-md";

const INDUSTRY_OPTION =
  "cursor-pointer px-4 py-3 text-sm transition-colors duration-200 hover:bg-neutral-100";

function StepJobPreferencesIndustry({
  register,
  setValue,
  errors,
  preferred_industry,
  industrySearch,
  setIndustrySearch,
  industryOpen,
  setIndustryOpen,
  allIndustries,
  loadingIndustries,
}) {
  const { t } = useTranslation("employeeOnboarding");

  const filteredIndustries = allIndustries.filter((item) =>
    item.toLowerCase().includes(industrySearch.toLowerCase()),
  );

  return (
    <div className={FORM_GROUP}>
      <label>
        {t("jobPreferences.industry.label")}
        {preferred_industry && !errors.preferred_industry && (
          <BIcon name="check-circle-fill" className="ms-1.5 text-success" />
        )}
      </label>
      <div className="relative">
        <input
          className={FIELD}
          value={industrySearch}
          placeholder={t("jobPreferences.industry.placeholder")}
          onFocus={() => setIndustryOpen(true)}
          onBlur={() => setTimeout(() => setIndustryOpen(false), 200)}
          onChange={(e) => {
            const val = e.target.value;
            setIndustrySearch(val);
            setIndustryOpen(true);

            const exactMatch = allIndustries.find(
              (ind) => ind.toLowerCase() === val.trim().toLowerCase()
            );

            if (exactMatch) {
              setValue("preferred_industry", exactMatch, { shouldValidate: true });
            } else if (preferred_industry) {
              setValue("preferred_industry", "", { shouldValidate: true });
            }
          }}
        />
        {loadingIndustries && (
          <div className="mt-1 text-xs text-neutral-500">{t("jobPreferences.industry.loading")}</div>
        )}

        {industryOpen && (
          <div className={INDUSTRY_DROPDOWN}>
            {filteredIndustries.map((item, i) => (
              <div
                key={i}
                className={INDUSTRY_OPTION}
                onClick={() => {
                  setValue("preferred_industry", item, {
                    shouldValidate: true,
                  });
                  setIndustrySearch(item);
                  setIndustryOpen(false);
                }}
              >
                {item}
              </div>
            ))}
            {!filteredIndustries.length && (
              <div
                className={cn(INDUSTRY_OPTION, "cursor-default text-neutral-400 hover:bg-transparent")}
              >
                {t("jobPreferences.industry.noResults")}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Hidden input to register with react-hook-form */}
      <input
        type="hidden"
        {...register("preferred_industry", {
          required: t("jobPreferences.industry.required"),
        })}
      />
      {errors.preferred_industry && (
        <p className={FIELD_ERROR}>{errors.preferred_industry.message}</p>
      )}
    </div>
  );
}

export default StepJobPreferencesIndustry;
