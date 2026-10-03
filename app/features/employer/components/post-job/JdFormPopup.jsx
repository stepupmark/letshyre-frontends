import { useMemo } from "react";
import overlay_img from "@/assets/JD-Upload.webp";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeJobSchema } from "@/features/employer/schemas/job.schema";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Sparkles, X, Check, FileText, AlignLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/common/FormSelect";

import { cn } from "@/lib/utils";

const JD_CONTROL =
  "h-auto w-full rounded-sm border border-border bg-card px-3.5 py-3 text-sm md:text-sm text-text-body shadow-none focus-visible:border-brand-600 focus-visible:ring-0";

// One row of the JD form, wired through shadcn's Form primitives for the
// id/label association and aria attributes.
function JdField({ name, label, wide = false, children }) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col gap-1.5", wide && "col-span-3 max-md:col-span-2 max-sm:col-span-1")}>
          <FormLabel>{label}</FormLabel>
          <FormControl>{children(field)}</FormControl>
          <FormMessage className="mt-1 text-xs text-danger" />
        </FormItem>
      )}
    />
  );
}

const textInput = (field) => <Input className={JD_CONTROL} {...field} />;

// The card skin animates transform, which would fight Radix's translate-based
// centring, so it lives on an inner element and DialogContent is a bare shell.
export function JdFormPopup({
  jobData,
  industryOptions,
  setShowJdPopup,
  handlePostJob,
  isPending,
}) {
  const { t } = useTranslation("employerJobs");
  const schema = useMemo(() => makeJobSchema(t), [t]);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...jobData,
      customIndustry: "", // Default to empty string for custom industry
    },
    mode: "all",
  });

  const selectedIndustry = useWatch({
    control: form.control,
    name: "industry_type",
  });

  const onSubmit = (data) => {
    handlePostJob(data);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && setShowJdPopup(false)}>
      <DialogContent
        className="flex h-[88vh] w-[95vw] sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-card p-0 shadow-2xl"
        overlayClassName="bg-text-main/40 backdrop-blur-xs"
        showCloseButton={false}
      >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <Sparkles size={24} className="text-brand-600" />
              <div>
                <DialogTitle asChild>
                  <h2>{t("postJob.form.title")}</h2>
                </DialogTitle>
                <DialogDescription asChild>
                  <p>{t("postJob.form.description")}</p>
                </DialogDescription>
              </div>
            </div>
            <DialogClose className="cursor-pointer border-0 bg-none text-2xl text-text-muted transition-colors duration-150 hover:text-text-main" aria-label={t("postJob.form.close")}>
              <X size={24} />
            </DialogClose>
          </div>

          <div className="flex flex-1 overflow-hidden max-md:flex-col">
            {/* Sidebar */}
            <div className="hidden md:flex w-64 sm:w-72 shrink-0 flex-col items-center justify-center overflow-y-auto border-e border-border bg-bg-subtle p-6">
              <img
                className="mb-4 max-h-44 w-auto object-contain"
                src={overlay_img}
                alt={t("postJob.form.illustrationAlt")}
              loading="lazy" decoding="async" />

              <div className="mb-6 text-center">
                <div className="mb-2 inline-flex size-8 items-center justify-center rounded-full bg-brand-600 text-text-white">
                  <Check size={20} />
                </div>
                <h4>{t("postJob.form.verifyTitle")}</h4>
                <p>{t("postJob.form.verifyBody")}</p>
              </div>
            </div>

            {/* Form */}
            <div className="flex flex-1 flex-col overflow-y-auto bg-card px-8 py-6 max-md:p-4">
              <Form {...form}>
                {/* Section 1: Job Information */}
                <div className="mt-2 mb-4 flex items-center gap-2">
                  <FileText size={14} />
                  <h3>{t("postJob.form.section1")}</h3>
                </div>

                <div className="mb-6 grid grid-cols-3 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
                  <JdField name="title" label={t("postJob.form.jobTitle")}>
                    {textInput}
                  </JdField>

                  <JdField name="work_type" label={t("postJob.form.workType")}>
                    {(field) => (
                      <FormSelect
                        size="auto"
                        className={JD_CONTROL}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t("postJob.form.selectWorkType")}
                        options={[
                          { value: "Hybrid", label: t("postJob.form.workTypes.hybrid") },
                          { value: "Remote", label: t("postJob.form.workTypes.remote") },
                          { value: "On-site", label: t("postJob.form.workTypes.onSite") },
                        ]}
                      />
                    )}
                  </JdField>

                  <JdField name="employment_type" label={t("postJob.form.employmentType")}>
                    {(field) => (
                      <FormSelect
                        size="auto"
                        className={JD_CONTROL}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t("postJob.form.selectEmploymentType")}
                        options={[
                          { value: "Full Time", label: t("postJob.form.employmentTypes.fullTime") },
                          { value: "Part Time", label: t("postJob.form.employmentTypes.partTime") },
                          { value: "Contract", label: t("postJob.form.employmentTypes.contract") },
                        ]}
                      />
                    )}
                  </JdField>

                  <div className={cn("flex flex-col gap-1.5", "col-span-3 max-md:col-span-2 max-sm:col-span-1")}>
                    <JdField name="industry_type" label={t("postJob.form.industryType")} wide>
                      {(field) => (
                        <FormSelect
                          size="auto"
                          className={JD_CONTROL}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder={t("postJob.form.selectIndustry")}
                          options={industryOptions}
                        />
                      )}
                    </JdField>

                    {/* Custom Industry Input */}
                    {selectedIndustry === "other" && (
                      <FormField
                        name="customIndustry"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormLabel className="sr-only">
                              {t("postJob.form.customIndustry")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className={JD_CONTROL}
                                placeholder={t("postJob.form.customIndustryPlaceholder")}
                              />
                            </FormControl>
                            <FormMessage className="mt-1 text-xs text-danger" />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <JdField
                    name="must_have_skills"
                    label={t("postJob.form.mustHaveSkills")}
                    wide
                  >
                    {textInput}
                  </JdField>

                  <JdField name="salary_range" label={t("postJob.form.salaryRange")}>
                    {textInput}
                  </JdField>

                  <JdField name="experience_required" label={t("postJob.form.experienceRequired")}>
                    {textInput}
                  </JdField>

                  <JdField name="number_of_openings" label={t("postJob.form.openings")}>
                    {(field) => <Input type="number" className={JD_CONTROL} {...field} />}
                  </JdField>

                  <JdField name="country" label={t("postJob.form.country")}>
                    {textInput}
                  </JdField>

                  <JdField name="state" label={t("postJob.form.state")}>
                    {textInput}
                  </JdField>

                  <JdField name="city" label={t("postJob.form.city")}>
                    {textInput}
                  </JdField>

                  <JdField name="location" label={t("postJob.form.location")} wide>
                    {(field) => (
                      <Input
                        {...field}
                        className={JD_CONTROL}
                        placeholder={t("postJob.form.locationPlaceholder")}
                      />
                    )}
                  </JdField>

                  <JdField name="education" label={t("postJob.form.education")}>
                    {textInput}
                  </JdField>

                  <JdField name="specialization" label={t("postJob.form.specialization")}>
                    {textInput}
                  </JdField>

                  <JdField
                    name="application_deadline"
                    label={t("postJob.form.applicationDeadline")}
                  >
                    {(field) => (
                      <Input
                        {...field}
                        className={JD_CONTROL}
                        type="date"
                        max="9999-12-31"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    )}
                  </JdField>
                </div>

                {/* Section 2: Job Description */}
                <div className="mt-2 mb-4 flex items-center gap-2">
                  <AlignLeft size={14} />
                  <h3>{t("postJob.form.section2")}</h3>
                </div>

                <div className="mb-6 grid grid-cols-3 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
                  <JdField name="job_description" label={t("postJob.form.jobOverview")} wide>
                    {(field) => <Textarea rows={4} className={`${JD_CONTROL} min-h-30 resize-y`} {...field} />}
                  </JdField>

                  <JdField name="description" label={t("postJob.form.responsibilities")} wide>
                    {(field) => <Textarea rows={5} className={`${JD_CONTROL} min-h-30 resize-y`} {...field} />}
                  </JdField>
                </div>

                {/* Footer / Actions */}
                <div className="mt-auto flex items-center justify-end gap-4 border-t border-border pt-6">
                  <Button
                    variant="ghost"
                    className="h-auto gap-2 rounded-md px-6 py-3 font-semibold text-brand-600 hover:bg-brand-100 hover:text-brand-600"
                    onClick={() => setShowJdPopup(false)}
                    type="button"
                  >
                    {t("postJob.form.goBack")}
                  </Button>

                  <Button
                    className="h-auto gap-2 rounded-md bg-brand-600 px-8 py-3 font-semibold text-white transition-all hover:bg-brand-600 hover:brightness-110 active:scale-97 disabled:opacity-60 motion-reduce:active:scale-100"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isPending}
                    type="button"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> {t("postJob.form.posting")}
                      </>
                    ) : (
                      <>
                        <Send size={16} /> {t("postJob.form.postJob")}
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}
