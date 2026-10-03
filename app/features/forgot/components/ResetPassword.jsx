import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForgotPasswordMutation } from "@/features/forgot/hooks/useForgotMutations";
import { resolveAuthErrorKey, isSessionExpiredKey } from "@/lib/authErrorMessages";

const makeSchema = (t) =>
  z
    .object({
      password: z.string().min(8, t("validation.passwordMin")),
      confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, {
      message: t("validation.passwordsNoMatch"),
      path: ["confirm"],
    });

/**
 * Forgot final step — set a new password.
 */
export function ForgotPasswordStep({ email, otpSessionKey, onNext, onSessionExpired }) {
  const { t } = useTranslation("auth");
  const mutation = useForgotPasswordMutation();

  const form = useForm({
    resolver: zodResolver(useMemo(() => makeSchema(t), [t])),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = (data) => {
    mutation.mutate(
      {
        email,
        otpSessionKey,
        newPassword: data.password,
        confirmPassword: data.confirm,
      },
      {
        onSuccess: () => onNext(),
        onError: (error) => {
          const key = resolveAuthErrorKey(error, { fallback: "toast.passwordResetFailed" });
          if (isSessionExpiredKey(key)) onSessionExpired?.();
        },
      },
    );
  };

  return (
    <>
      <h1 className="mt-0 mb-8 text-center text-[clamp(1.5rem,1.3rem_+_1vw,1.875rem)] leading-[1.2] font-extrabold text-text-main">
        <Trans
          t={t}
          i18nKey="forgot.resetTitle"
          components={{ accent: <span className="text-brand-600" /> }}
        />
      </h1>
      <p className="-mt-6 mb-6 text-center text-sm leading-[1.6] text-neutral-500">{t("forgot.resetSubtitle")}</p>

      <Form {...form}>
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <AuthPasswordField
          name="password"
          label={t("fields.newPassword")}
          autoComplete="new-password"
          capsHint
        />
        <AuthPasswordField
          name="confirm"
          label={t("fields.confirmPassword")}
          autoComplete="new-password"
        />
        <Button
          className="mt-2 h-auto w-full rounded-full border-0 bg-text-main px-6 py-4 text-base font-bold text-white shadow-lg transition-all duration-150 hover:-translate-y-px hover:bg-text-main hover:shadow-xl disabled:opacity-65 motion-reduce:hover:translate-y-0"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <span className="size-4 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" aria-hidden="true" />
              {t("forgot.resetting")}
            </>
          ) : (
            t("forgot.reset")
          )}
        </Button>
      </form>
      </Form>
    </>
  );
}

export default ForgotPasswordStep;
