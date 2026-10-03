import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { makeTeamSchemas } from "@/features/employer/schemas/team.schema";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UserPlus, UserCog, X, User, Mail, Lock, Eye, EyeOff } from "lucide-react";


const TEAM_INPUT =
  "h-auto w-full rounded-sm border border-neutral-300 px-4 py-3 text-sm md:text-sm text-text-main shadow-none placeholder:text-neutral-400 focus-visible:border-brand-500 focus-visible:ring-[3px] focus-visible:ring-brand-500/10";

export function TeamMemberModal({
  isOpen,
  onClose,
  onSubmit,
  memberToEdit,
  isPending,
}) {
  const { t } = useTranslation("employer");
  const isEditing = !!memberToEdit;
  const schemas = useMemo(() => makeTeamSchemas(t), [t]);
  const schema = isEditing ? schemas.editMemberSchema : schemas.addMemberSchema;

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (isOpen) {
      // Bundled with the (necessarily imperative) react-hook-form reset() below
      // so both reset together whenever the dialog reopens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowPassword(false);
      if (isEditing && memberToEdit) {
        reset({
          full_name: memberToEdit.full_name || "",
          email: memberToEdit.email || "",
          password: "",
        });
      } else {
        reset({
          full_name: "",
          email: "",
          password: "",
        });
      }
    }
  }, [isOpen, isEditing, memberToEdit, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  // Radix portals the content itself, so the manual createPortal is gone.
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-auto max-w-none border-0 bg-transparent p-0 shadow-none"
        overlayClassName="bg-text-main/40 backdrop-blur-xs"
        showCloseButton={false}
      >
        <div className="relative w-full max-w-130 rounded-lg bg-card p-8 shadow-xl">
          <DialogClose className="absolute top-4 end-4 flex size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-bg-subtle text-text-muted transition-all duration-200 hover:bg-neutral-100 hover:text-text-main" aria-label={t("team.modal.close")}>
            <X size={16} />
          </DialogClose>

          <div className="mb-6 flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              {isEditing ? <UserCog size={24} /> : <UserPlus size={24} />}
            </div>
            <div>
              <DialogTitle asChild>
                <h3 className="mt-0 mb-1.5 text-xl font-bold text-text-body">
                  {isEditing ? t("team.modal.editTitle") : t("team.modal.addTitle")}
                </h3>
              </DialogTitle>
              <DialogDescription asChild>
                <p className="m-0 text-sm leading-normal text-neutral-500">
                  {isEditing ? t("team.modal.editDesc") : t("team.modal.addDesc")}
                </p>
              </DialogDescription>
            </div>
          </div>

        <hr className="my-6 border-0 border-t border-border" />

        <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <FormField
            name="full_name"
            render={({ field, fieldState }) => (
              <FormItem className="mb-5 flex flex-col">
                <FormLabel className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700">
                  <User size={14} /> {t("team.modal.fullName")}
                </FormLabel>
                <div className="relative flex items-center">
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder={t("team.modal.fullNamePlaceholder")}
                      className={cn(
                        TEAM_INPUT,
                        fieldState.error &&
                          "border-danger focus-visible:border-danger focus-visible:ring-danger/10",
                      )}
                    />
                  </FormControl>
                </div>
                <FormMessage className="mt-1.5 text-xs text-danger" />
              </FormItem>
            )}
          />

          <FormField
            name="email"
            render={({ field, fieldState }) => (
              <FormItem className="mb-5 flex flex-col">
                <FormLabel className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700">
                  <Mail size={14} /> {t("team.modal.email")}
                </FormLabel>
                <div className="relative flex items-center">
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t("team.modal.emailPlaceholder")}
                      className={cn(
                        TEAM_INPUT,
                        fieldState.error &&
                          "border-danger focus-visible:border-danger focus-visible:ring-danger/10",
                      )}
                    />
                  </FormControl>
                </div>
                <FormMessage className="mt-1.5 text-xs text-danger" />
              </FormItem>
            )}
          />

          {!isEditing && (
            <FormField
              name="password"
              render={({ field, fieldState }) => (
                <FormItem className="mb-5 flex flex-col">
                  <FormLabel className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <Lock size={14} /> {t("team.modal.password")}
                  </FormLabel>
                  <div className="relative flex items-center">
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder={t("team.modal.passwordPlaceholder")}
                        className={cn(
                        TEAM_INPUT,
                        fieldState.error &&
                          "border-danger focus-visible:border-danger focus-visible:ring-danger/10",
                      )}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute end-4 text-neutral-500 hover:bg-transparent hover:text-neutral-600"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? t("team.modal.hidePassword") : t("team.modal.showPassword")}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  {fieldState.error ? (
                    <FormMessage className="mt-1.5 text-xs text-danger" />
                  ) : (
                    <FormDescription className="mt-1.5 text-xs text-neutral-500">
                      {t("team.modal.passwordHint")}
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />
          )}

          <div className="mt-8 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-auto flex-1 rounded-sm border-border bg-card py-3 text-sm font-semibold text-neutral-600 hover:bg-bg-subtle hover:text-neutral-600"
              onClick={onClose}
              disabled={isPending}
            >
              {t("team.modal.cancel")}
            </Button>
            <Button
              type="submit"
              className="h-auto flex-1 rounded-sm bg-brand-600 py-3 text-sm font-semibold hover:bg-brand-700 disabled:opacity-70"
              disabled={isPending}
            >
              {isPending
                ? t("team.modal.saving")
                : isEditing
                ? <><UserCog size={16} /> {t("team.modal.updateMember")}</>
                : <><UserPlus size={16} /> {t("team.modal.addMemberBtn")}</>}
            </Button>
          </div>
        </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
