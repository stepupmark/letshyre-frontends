import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "@/lib/toast";
import { Share2, CalendarClock, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSelect } from "@/components/common/FormSelect";
import { CopyLinkButton } from "@/features/employer/components/scorecard-sharing/CopyLinkButton";
import {
  useCreateShareLink,
  useShareJobOptions,
} from "@/features/employer/hooks/useSharedLinks";
import { makeShareLinkSchemas } from "@/features/employer/schemas/shareLink.schema";
import { formatDate } from "@/features/employer/components/view-jobs/jobFormat";
import { useAppLocale } from "@/i18n/appLocale";
import { buildShareUrl } from "@/lib/shareUrl";

const DEFAULT_VALUES = {
  job_id: "",
  expires_in_days: 20,
  max_views: 20,
};

export function ShareLinkDialog({ candidate }) {
  const { t } = useTranslation("employer");
  const { locale } = useAppLocale();
  const [open, setOpen] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);

  const { createShareLinkSchema } = useMemo(() => makeShareLinkSchemas(t), [t]);
  const { options: jobOptions, isLoading: jobsLoading } = useShareJobOptions();
  const { mutate: createLink, isPending } = useCreateShareLink();

  const form = useForm({
    resolver: zodResolver(createShareLinkSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const handleOpenChange = (next) => {
    if (next) {
      setCreatedLink(null);
      form.reset(DEFAULT_VALUES);
    }
    setOpen(next);
  };

  const handleSubmit = (values) => {
    createLink(
      { candidateId: candidate.id, payload: values },
      {
        onSuccess: (res) => {
          const data = res.data?.data;
          if (res.data?.success && data) {
            setCreatedLink(data);
            toast.success(t("sharing.toasts.created"));
            return;
          }
          toast.error(res.data?.message || t("sharing.toasts.createFailed"));
        },
        onError: (err) => {
          const fieldErrors = err.response?.data?.data;
          if (fieldErrors && typeof fieldErrors === "object") {
            let mapped = false;
            for (const [field, messages] of Object.entries(fieldErrors)) {
              if (field in DEFAULT_VALUES) {
                form.setError(field, {
                  message: Array.isArray(messages)
                    ? messages.join(" ")
                    : String(messages),
                });
                mapped = true;
              }
            }
            if (mapped) return;
          }
          toast.error(
            err.response?.data?.message || t("sharing.toasts.createFailed"),
          );
        },
      },
    );
  };

  const expiresOn = createdLink
    ? formatDate(createdLink.expires_at, locale)
    : null;
  const shareUrl = createdLink ? buildShareUrl(createdLink) : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => handleOpenChange(true)}
      >
        <Share2 size={14} />
        {t("sharing.shareAction")}
      </Button>

      <DialogContent className="gap-6 p-7 sm:max-w-lg">
        {createdLink ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("sharing.successDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("sharing.successDialog.description", {
                  name: candidate.candidate_name || candidate.name,
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="flex min-w-0 flex-col gap-4 rounded-md border border-border bg-bg-subtle p-5">
              <p
                className="m-0 min-w-0 truncate text-sm text-text-body"
                title={shareUrl}
              >
                {shareUrl}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock size={13} aria-hidden="true" />
                  {t("sharing.successDialog.expiresOn", { date: expiresOn })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye size={13} aria-hidden="true" />
                  {t("sharing.successDialog.viewLimit", {
                    count: createdLink.max_views,
                  })}
                </span>
              </div>
              <CopyLinkButton url={shareUrl} className="w-full" />
            </div>

            <DialogFooter>
              <Button type="button" onClick={() => setOpen(false)}>
                {t("sharing.successDialog.done")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {t("sharing.createDialog.title", {
                  name: candidate.candidate_name || candidate.name,
                })}
              </DialogTitle>
              <DialogDescription>
                {t("sharing.createDialog.description")}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col gap-5"
              >
                <FormField
                  name="job_id"
                  render={({ field }) => (
                    <FormItem className="gap-2.5">
                      <FormLabel>
                        {t("sharing.createDialog.jobLabel")}
                      </FormLabel>
                      <FormControl>
                        <FormSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          options={jobOptions}
                          disabled={jobsLoading}
                          placeholder={
                            jobsLoading
                              ? t("sharing.createDialog.jobLoading")
                              : jobOptions.length === 0
                                ? t("sharing.createDialog.jobEmpty")
                                : t("sharing.createDialog.jobPlaceholder")
                          }
                          aria-label={t("sharing.createDialog.jobLabel")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="expires_in_days"
                  render={({ field }) => (
                    <FormItem className="gap-2.5">
                      <FormLabel>
                        {t("sharing.createDialog.expiryLabel")}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={30} {...field} />
                      </FormControl>
                      <FormDescription>
                        {t("sharing.createDialog.expiryHint")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="max_views"
                  render={({ field }) => (
                    <FormItem className="gap-2.5">
                      <FormLabel>
                        {t("sharing.createDialog.maxViewsLabel")}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormDescription>
                        {t("sharing.createDialog.maxViewsHint")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isPending}
                  >
                    {t("sharing.createDialog.cancel")}
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending
                      ? t("sharing.createDialog.submitting")
                      : t("sharing.createDialog.submit")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
