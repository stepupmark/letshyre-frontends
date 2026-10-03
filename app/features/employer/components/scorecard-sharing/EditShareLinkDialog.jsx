import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "@/lib/toast";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateShareLink } from "@/features/employer/hooks/useSharedLinks";
import { makeShareLinkSchemas } from "@/features/employer/schemas/shareLink.schema";

const EDITABLE_FIELDS = ["extend_expiry_days", "max_views", "is_active"];

// A bit roomier than shadcn's stock max-w-lg/p-6 default so the three fields
// don't read cramped, matching ShareLinkDialog's sizing.
const DIALOG_CONTENT = "gap-6 p-7 sm:max-w-lg";

export function EditShareLinkDialog({ link, open, onOpenChange }) {
  const { t } = useTranslation("sharedLinks");
  // Validation messages live under "employer" (shared with the create-link
  // form's schema) so they're translated once, not duplicated per namespace.
  const { t: tValidation } = useTranslation("employer");
  const { editShareLinkSchema } = useMemo(() => makeShareLinkSchemas(tValidation), [tValidation]);
  const { mutate: updateLink, isPending } = useUpdateShareLink();

  const form = useForm({
    resolver: zodResolver(editShareLinkSchema),
    defaultValues: { extend_expiry_days: 0, max_views: 20, is_active: true },
  });

  useEffect(() => {
    if (open && link) {
      form.reset({
        extend_expiry_days: 0,
        max_views: link.max_views,
        is_active: link.is_active,
      });
    }
  }, [open, link, form]);

  const handleSubmit = (values) => {
    updateLink(
      { id: link.id, payload: values },
      {
        onSuccess: (res) => {
          if (res.data?.success) {
            toast.success(t("toasts.updated"));
            onOpenChange(false);
            return;
          }
          toast.error(res.data?.message || t("toasts.updateFailed"));
        },
        onError: (err) => {
          const fieldErrors = err.response?.data?.data;
          if (fieldErrors && typeof fieldErrors === "object") {
            let mapped = false;
            for (const [field, messages] of Object.entries(fieldErrors)) {
              if (EDITABLE_FIELDS.includes(field)) {
                form.setError(field, {
                  message: Array.isArray(messages) ? messages.join(" ") : String(messages),
                });
                mapped = true;
              }
            }
            if (mapped) return;
          }
          toast.error(
            err.response?.data?.message || t("toasts.updateFailed"),
          );
        },
      },
    );
  };

  if (!link) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_CONTENT}>
        <DialogHeader>
          <DialogTitle>{t("editDialog.title")}</DialogTitle>
          <DialogDescription>{t("editDialog.description")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
            <FormField
              name="extend_expiry_days"
              render={({ field }) => (
                <FormItem className="gap-2.5">
                  <FormLabel>{t("editDialog.extendLabel")}</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={30} {...field} />
                  </FormControl>
                  <FormDescription>{t("editDialog.extendHint")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="max_views"
              render={({ field }) => (
                <FormItem className="gap-2.5">
                  <FormLabel>{t("editDialog.maxViewsLabel")}</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 rounded-md border border-border bg-bg-subtle p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="share-link-active"
                    />
                  </FormControl>
                  <div className="grid gap-1.5 leading-none">
                    <FormLabel htmlFor="share-link-active" className="font-normal">
                      {t("editDialog.activeLabel")}
                    </FormLabel>
                    <FormDescription>{t("editDialog.activeHint")}</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="mt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {t("editDialog.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("editDialog.submitting") : t("editDialog.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
