import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import { toast } from "@/lib/toast";
import { User, Mail } from "lucide-react";
import { AuthTextField } from "../AuthTextField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { resolveAuthErrorKey, FIELD_FOR_ERROR_KEY } from "@/lib/authErrorMessages";

const makeSchema = (t) =>
  z.object({
    fullName: z.string().min(2, t("validation.fullNameRequired")),
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
  });

/**
 * Register step 1 — collect name + email and send the email OTP.
 */
export function RegisterEmailStep({
  role,
  mutation,
  loginRoute,
  onNext,
  registerData = {},
}) {
  const { t } = useTranslation("auth");
  const isEmployer = role === "Employer";
  const roleLabel = t(isEmployer ? "roles.employer" : "roles.employee");

  const form = useForm({
    resolver: zodResolver(useMemo(() => makeSchema(t), [t])),
    // Seed from the wizard bag so returning via Back keeps prior entries.
    defaultValues: {
      fullName: registerData.name ?? "",
      email: registerData.email ?? "",
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(
      { email: data.email },
      {
        onSuccess: (res) => {
          if (!res?.otpSessionKey) {
            toast.error(t("toast.verificationStartFailed"));
            return;
          }
          onNext({
            name: data.fullName,
            email: data.email,
            emailOtpSessionKey: res.otpSessionKey,
          });
        },
        onError: (error) => {
          const key = resolveAuthErrorKey(error, { fallback: "toast.otpSendFailed" });
          if (FIELD_FOR_ERROR_KEY[key] === "email") {
            form.setError("email", { message: t(key) });
          }
        },
      },
    );
  };

  return (
    <>
      <h1 className="mt-0 mb-8 text-center text-[clamp(1.5rem,1.3rem_+_1vw,1.875rem)] leading-[1.2] font-extrabold text-text-main">
        <Trans
          t={t}
          i18nKey="register.title"
          values={{ role: roleLabel }}
          components={{ accent: <span className="text-brand-600" /> }}
        />
      </h1>
      <p className="-mt-6 mb-6 text-center text-sm leading-[1.6] text-neutral-500">
        {t(isEmployer ? "register.subtitleEmployer" : "register.subtitleEmployee")}
      </p>

      <Form {...form}>
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <AuthTextField
          name="fullName"
          label={t("fields.fullName")}
          icon={User}
          placeholder={t("placeholders.fullName")}
          autoComplete="name"
          autoFocus
        />
        <AuthTextField
          name="email"
          label={t("fields.email")}
          type="email"
          icon={Mail}
          placeholder={t("placeholders.email")}
          autoComplete="email"
          inputMode="email"
        />
        <Button
          className="mt-2 h-auto w-full rounded-full border-0 bg-text-main px-6 py-4 text-base font-bold text-white shadow-lg transition-all duration-150 hover:-translate-y-px hover:bg-text-main hover:shadow-xl disabled:opacity-65 motion-reduce:hover:translate-y-0"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <span className="size-4 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" aria-hidden="true" />
              {t("register.sendingOtp")}
            </>
          ) : (
            t("register.verifyEmail")
          )}
        </Button>
      </form>
      </Form>

      <p className="mt-2 text-center text-sm leading-[1.9] text-neutral-500">
        {t("register.haveAccount")}
        <br />
        <Link to={loginRoute} className={cn("h-auto bg-transparent p-0 text-sm font-semibold text-brand-600 hover:bg-transparent hover:text-brand-700 hover:underline hover:underline-offset-2", "text-base font-bold")}>
          {t("register.backToLogin")}
        </Link>
      </p>
    </>
  );
}
