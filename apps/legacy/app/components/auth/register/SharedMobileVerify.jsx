import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/lib/toast";
import { Phone } from "lucide-react";
import { AuthTextField } from "../AuthTextField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { resolveAuthErrorKey, FIELD_FOR_ERROR_KEY } from "@/lib/authErrorMessages";

const makeSchema = (t) =>
  z.object({
    mobile: z
      .string()
      .length(10, t("validation.mobileInvalid"))
      .regex(/^\d+$/, t("validation.digitsOnly")),
  });

/**
 * Register step 3 — collect the mobile number and send the mobile OTP.
 */
export function RegisterMobileStep({ role, mutation, onNext, registerData = {} }) {
  const { t } = useTranslation("auth");
  const roleLabel = t(role === "Employer" ? "roles.employer" : "roles.employee");

  const form = useForm({
    resolver: zodResolver(useMemo(() => makeSchema(t), [t])),
    // Seed from the wizard bag so returning via Back keeps the number.
    defaultValues: { mobile: registerData.phone_number ?? "" },
  });

  const onSubmit = (data) => {
    mutation.mutate(
      { phone_number: data.mobile },
      {
        onSuccess: (res) => {
          if (!res?.otpSessionKey) {
            toast.error(t("toast.otpSendGenericFailed"));
            return;
          }
          onNext({
            phone_number: data.mobile,
            mobileOtpSessionKey: res.otpSessionKey,
          });
        },
        onError: (error) => {
          const key = resolveAuthErrorKey(error, { fallback: "toast.mobileOtpSendFailed" });
          if (FIELD_FOR_ERROR_KEY[key] === "mobile") {
            form.setError("mobile", { message: t(key) });
          }
        },
      },
    );
  };

  // Keep the field numeric and capped at 10 digits.
  const sanitizeMobile = (e) =>
    form.setValue("mobile", e.target.value.replace(/\D/g, "").slice(0, 10), {
      shouldValidate: true,
    });

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
        {t("register.subtitleMobile")}
      </p>

      <Form {...form}>
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <AuthTextField
          name="mobile"
          label={t("fields.mobile")}
          icon={Phone}
          placeholder={t("placeholders.mobile")}
          inputMode="numeric"
          autoFocus
          maxLength={10}
          onChange={sanitizeMobile}
        />
        <Button
          className="mt-2 h-auto w-full rounded-full border-0 bg-text-main px-6 py-4 text-base font-bold text-white shadow-lg transition-all duration-150 hover:-translate-y-px hover:bg-text-main hover:shadow-xl disabled:opacity-65 motion-reduce:hover:translate-y-0"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <span className="size-4 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" aria-hidden="true" />
              {t("register.sending")}
            </>
          ) : (
            t("register.sendOtp")
          )}
        </Button>
      </form>
      </Form>
    </>
  );
}
