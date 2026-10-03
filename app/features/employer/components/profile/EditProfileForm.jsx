import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeEmployerProfileSchema } from "@/features/employer/schemas/profile.schema";
import { useIndustries } from "@/hooks/useIndustries";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  X,
  Mail,
  MapPin,
  Briefcase,
  Link2,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";
import img03 from "@/assets/emp-profile03.webp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/common/FormSelect";
import { resolveIndustryValue } from "@/features/employer/lib/industry";
import { cn } from "@/lib/utils";


// ps-10 leaves room for the leading icon; aria-invalid:border-danger draws the
// error border (FormControl sets aria-invalid on the control itself).
const PROFILE_CONTROL =
  "h-auto w-full rounded-md border border-border bg-bg-subtle py-3 pe-4 ps-10 text-base md:text-base text-text-main shadow-none aria-invalid:border-danger focus-visible:border-brand-600 focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-brand-600/10";


const PROFILE_ACTION_BASE =
  "h-auto rounded-md px-8 py-3 text-base font-semibold";

const PROFILE_CANCEL_CLASS = `${PROFILE_ACTION_BASE} border-border bg-card text-text-main hover:bg-neutral-100 hover:text-text-main`;

const PROFILE_SAVE_CLASS = `${PROFILE_ACTION_BASE} bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md disabled:opacity-70`;

// One field row; the error border rides on the control's own aria-invalid.
function ProfileField({ name, label, icon: Icon, wide = false, children }) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col gap-2", wide && "col-span-full")}>
          <FormLabel className="text-sm font-semibold text-text-main">{label}</FormLabel>
          {Icon ? (
            <div className="relative">
              <Icon
                size={16}
                className="pointer-events-none absolute start-3 top-1/2 z-10 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
              <FormControl>{children(field)}</FormControl>
            </div>
          ) : (
            <FormControl>{children(field)}</FormControl>
          )}
          <FormMessage className="mt-1 text-xs text-danger" />
        </FormItem>
      )}
    />
  );
}

export const EditProfileForm = ({
  profile,
  kyc,
  onCancel,
  updateKycMutation,
}) => {
  const { t } = useTranslation("employer");
  const { data: industries = [] } = useIndustries();
  const schema = useMemo(() => makeEmployerProfileSchema(t), [t]);

  const storedIndustry = kyc?.company_industry;

  // The modal mounts with the profile already loaded, so the saved values seed
  // the form once; a later refetch (fresh S3 links) can't wipe what's typed.
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      email: kyc?.official_email || profile?.email || "",
      location: kyc?.company_address || profile?.location || "",
      industry: resolveIndustryValue(storedIndustry, industries),
      linkedinUrl: kyc?.linkedin_url || "",
      companyDescription: kyc?.company_description || "",
      companyLogo: undefined,
    },
  });

  const { control, trigger, setValue, getFieldState } = form;

  const companyLogoFiles = useWatch({ control, name: "companyLogo" });
  const logoFileName = companyLogoFiles?.[0]?.name;

  const getExistingFileName = (url) => {
    if (!url) return "Company Logo";
    try {
      const parts = url.split("/");
      const lastPart = parts[parts.length - 1];
      return lastPart.split("?")[0] || t("profile.edit.companyLogo");
    } catch {
      return t("profile.edit.companyLogo");
    }
  };
  const displayFileName =
    logoFileName ||
    (kyc?.company_logo ? getExistingFileName(kyc.company_logo) : t("profile.edit.companyLogo"));

  // Preview the freshly picked file, falling back to whatever is already
  // saved. Derived rather than stored so the two can't drift apart.
  const pickedLogo = companyLogoFiles?.[0];
  const pickedLogoUrl = useMemo(
    () => (pickedLogo ? URL.createObjectURL(pickedLogo) : null),
    [pickedLogo],
  );
  useEffect(
    () => () => {
      if (pickedLogoUrl) URL.revokeObjectURL(pickedLogoUrl);
    },
    [pickedLogoUrl],
  );
  const logoPreview = pickedLogoUrl || kyc?.company_logo || null;

  // Match the saved industry to its option once the list arrives, unless the
  // employer has already picked one.
  useEffect(() => {
    if (getFieldState("industry").isDirty) return;
    setValue("industry", resolveIndustryValue(storedIndustry, industries));
  }, [industries, storedIndustry, setValue, getFieldState]);

  // Surface an unknown/legacy stored value as an option so the trigger is never
  // silently blank and the value stays selectable; canonical options still win.
  const industryOptions = useMemo(() => {
    const resolved = resolveIndustryValue(storedIndustry, industries);
    if (resolved && !industries.some((o) => o.value === resolved)) {
      return [{ value: resolved, label: storedIndustry }, ...industries];
    }
    return industries;
  }, [industries, storedIndustry]);

  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = async () => {
    const isStep1Valid = await trigger([
      "email",
      "location",
      "industry",
      "linkedinUrl",
    ]);
    if (isStep1Valid) {
      setCurrentStep(2);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("company_industry", data.industry);
    formData.append("company_description", data.companyDescription);
    formData.append("company_address", data.location);
    formData.append("linkedin_url", data.linkedinUrl);
    formData.append("official_email", data.email);

    if (data.companyLogo && data.companyLogo[0]) {
      formData.append("company_logo", data.companyLogo[0]);
    }

    updateKycMutation.mutate(formData, {
      onSuccess: () => {
        onCancel();
      },
    });
  };

  const isSaving = form.formState.isSubmitting || updateKycMutation.isPending;

  return (
    <div className="relative flex overflow-hidden rounded-lg border border-border bg-card shadow-lg">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onCancel}
        className="absolute top-4 end-4 z-10 text-neutral-500"
        aria-label={t("profile.edit.close")}
      >
        <X size={20} />
      </Button>

      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 p-12 lg:flex">
        <img
          src={img03}
          alt={t("profile.edit.illustrationAlt")}
          className="max-h-112.5 max-w-full object-contain"
        loading="lazy" decoding="async" />
      </div>

      <div className="flex flex-[2] flex-col px-8 py-12">
        <h2 className="mb-8 text-3xl font-bold text-text-main">{t("profile.edit.title")}</h2>

        <div className="scrollbar-thin overflow-y-auto pe-4">
          <Form {...form}>
            <form className="grid grid-cols-1 gap-6 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
              {currentStep === 1 && (
                <>
                  <div className={cn("col-span-full", "mb-2")}>
                    <h3 className="text-xl text-text-main">
                      {t("profile.edit.step1")}
                    </h3>
                  </div>

                  <ProfileField name="email" label={t("profile.edit.officialEmail")} icon={Mail}>
                    {(field) => (
                      <Input
                        {...field}
                        className={PROFILE_CONTROL}
                        type="email"
                        placeholder={t("profile.edit.emailPlaceholder")}
                      />
                    )}
                  </ProfileField>

                  <ProfileField name="location" label={t("profile.edit.location")} icon={MapPin}>
                    {(field) => (
                      <Input
                        {...field}
                        className={PROFILE_CONTROL}
                        type="text"
                        placeholder={t("profile.edit.locationPlaceholder")}
                      />
                    )}
                  </ProfileField>

                  <ProfileField
                    name="industry"
                    label={t("profile.edit.industry")}
                    icon={Briefcase}
                  >
                    {(field) => (
                      <FormSelect
                        size="auto"
                        className={PROFILE_CONTROL}
                        contentClassName="z-[1001]"
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t("profile.edit.selectIndustry")}
                        options={industryOptions}
                      />
                    )}
                  </ProfileField>

                  <ProfileField
                    name="linkedinUrl"
                    label={t("profile.edit.linkedinUrl")}
                    icon={Link2}
                  >
                    {(field) => (
                      <Input
                        {...field}
                        className={PROFILE_CONTROL}
                        type="url"
                        placeholder={t("profile.edit.linkedinPlaceholder")}
                      />
                    )}
                  </ProfileField>

                  {/* Action Buttons */}
                  <div className={cn("mt-4 flex justify-end gap-4 border-t border-border pt-6", "col-span-full")}>
                    <Button
                      type="button"
                      variant="outline"
                      className={PROFILE_CANCEL_CLASS}
                      onClick={onCancel}
                    >
                      {t("profile.edit.cancel")}
                    </Button>
                    <Button
                      type="button"
                      className={PROFILE_SAVE_CLASS}
                      onClick={handleNext}
                    >
                      {t("profile.edit.next")}
                    </Button>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className={cn("col-span-full", "mb-2")}>
                    <h3 className="text-xl text-text-main">
                      {t("profile.edit.step2")}
                    </h3>
                  </div>

                  <ProfileField
                    name="companyDescription"
                    label={t("profile.edit.companyDescription")}
                    wide
                  >
                    {(field) => (
                      <Textarea
                        className={`${PROFILE_CONTROL} min-h-30 resize-y`}
                        {...field}
                        rows="4"
                        placeholder={t("profile.edit.descriptionPlaceholder")}
                      />
                    )}
                  </ProfileField>

                  {/* File input: its own FormField (not ProfileField) since
                      `value` can't be spread on it and onChange hands the
                      FileList, not the event, to react-hook-form. */}
                  <FormField
                    name="companyLogo"
                    render={({ field: { onChange, onBlur, name, ref } }) => (
                      <FormItem className={cn("flex flex-col gap-2", "col-span-full")}>
                        <FormLabel className="text-sm font-semibold text-text-main">{t("profile.edit.companyLogo")}</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.svg,.webp"
                              id="companyLogoUpload"
                              className="hidden"
                              name={name}
                              ref={ref}
                              onBlur={onBlur}
                              onChange={(e) => onChange(e.target.files)}
                            />
                          </FormControl>
                          <label
                            htmlFor="companyLogoUpload"
                            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-bg-subtle p-4 text-center text-text-muted transition-all hover:border-brand-600 hover:bg-brand-100"
                          >
                            <div className="flex w-full items-center justify-center gap-6">
                              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card shadow-sm">
                                {logoPreview ? (
                                  <img
                                    src={logoPreview}
                                    alt={t("profile.edit.logoPreviewAlt")}
                                    className="size-full object-contain p-2"
                                  loading="lazy" decoding="async" />
                                ) : (
                                  <ImageIcon
                                    size={32}
                                    className="text-neutral-300"
                                  />
                                )}
                              </div>
                              <div className="flex flex-col items-start gap-1 text-start">
                                <span className="text-sm font-semibold break-all text-text-main">
                                  {logoPreview
                                    ? displayFileName
                                    : t("profile.edit.noLogoUploaded")}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm font-medium text-brand-600">
                                  <UploadCloud size={16} />
                                  {logoPreview
                                    ? t("profile.edit.uploadNewLogo")
                                    : t("profile.edit.uploadLogo")}
                                </span>
                                <span className="text-xs text-text-muted">
                                  {t("profile.edit.logoHint")}
                                </span>
                              </div>
                            </div>
                          </label>
                        </div>
                        <FormMessage className="mt-1 text-xs text-danger" />
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className={cn("mt-4 flex justify-end gap-4 border-t border-border pt-6", "col-span-full")}>
                    <Button
                      type="button"
                      variant="outline"
                      className={PROFILE_CANCEL_CLASS}
                      onClick={() => setCurrentStep(1)}
                      disabled={isSaving}
                    >
                      {t("profile.edit.back")}
                    </Button>
                    <Button
                      type="submit"
                      className={PROFILE_SAVE_CLASS}
                      disabled={isSaving}
                    >
                      {updateKycMutation.isPending ? t("profile.edit.saving") : t("profile.edit.saveChanges")}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
