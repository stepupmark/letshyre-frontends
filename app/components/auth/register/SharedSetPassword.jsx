import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import { toast } from "@/lib/toast";
import { DEFAULT_LOCALE, localePath } from "@/i18n/config";
import { AuthPasswordField } from "../AuthPasswordField";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useFinalRegisterMutation } from "@/hooks/useRegisterMutations";
import { resolveAuthErrorKey, isSessionExpiredKey } from "@/lib/authErrorMessages";
import { trackEvent } from "@/lib/metaPixel";

const makeSchema = (t) =>
  z
    .object({
      password: z.string().min(8, t("validation.passwordMin")),
      confirmPassword: z.string(),
      agreed_to_terms: z.boolean().refine((v) => v === true, {
        message: t("validation.mustAgreeTerms"),
      }),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t("validation.passwordsNoMatch"),
      path: ["confirmPassword"],
    });

/**
 * Register final step — set a password, accept terms, and create the account.
 */
export function RegisterPasswordStep({ role, registerData, onNext, onSessionExpired }) {
  const { t } = useTranslation("auth");
  const roleLabel = t(
    role === "Employer" ? "roles.employer" : "roles.employee",
  );
  const mutation = useFinalRegisterMutation();

  const form = useForm({
    resolver: zodResolver(useMemo(() => makeSchema(t), [t])),
    defaultValues: {
      password: "",
      confirmPassword: "",
      agreed_to_terms: false,
    },
  });

  const onError = (errs) => {
    if (errs.agreed_to_terms) {
      toast.error(t("validation.mustAgreeTerms"));
    }
  };

  const onSubmit = (data) => {
    mutation.mutate(
      {
        ...registerData,
        password: data.password,
        confirm_password: data.confirmPassword,
        agreed_to_terms: data.agreed_to_terms,
        role,
      },
      {
        onSuccess: () => {
          trackEvent("CompleteRegistration", { content_name: role });
          onNext();
        },
        onError: (error) => {
          const key = resolveAuthErrorKey(error, { fallback: "toast.registerFailed" });
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
          i18nKey="register.passwordTitle"
          values={{ role: roleLabel }}
          components={{ accent: <span className="text-brand-600" /> }}
        />
      </h1>
      <p className="-mt-6 mb-6 text-center text-sm leading-[1.6] text-neutral-500">
        {t("register.passwordSubtitle")}
      </p>

      <Form {...form}>
        <form
          className="flex flex-col gap-5"
          onSubmit={form.handleSubmit(onSubmit, onError)}
          noValidate
        >
          <AuthPasswordField
            name="password"
            label={t("fields.password")}
            autoComplete="new-password"
            capsHint
          />
          <AuthPasswordField
            name="confirmPassword"
            label={t("fields.confirmPassword")}
            autoComplete="new-password"
          />

          <FormField
            name="agreed_to_terms"
            render={({ field }) => (
              <FormItem className="text-start">
                <div className="flex items-start gap-2.5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  </FormControl>
                  {/* FormLabel (not a raw <label>) reads htmlFor from form context to link to the Radix checkbox. */}
                  <FormLabel className="text-sm leading-normal font-normal text-neutral-500 [&_a]:font-semibold [&_a]:text-brand-600 [&_a]:underline [&_a]:underline-offset-2">
                    <Trans
                      t={t}
                      i18nKey="register.agree"
                      components={{
                        terms: (
                          <Link
                            to={localePath(DEFAULT_LOCALE, "/terms")}
                            target="_blank"
                          />
                        ),
                        privacy: (
                          <Link
                            to={localePath(DEFAULT_LOCALE, "/policy")}
                            target="_blank"
                          />
                        ),
                      }}
                    />
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="mt-2 h-auto w-full rounded-full border-0 bg-text-main px-6 py-4 text-base font-bold text-white shadow-lg transition-all duration-150 hover:-translate-y-px hover:bg-text-main hover:shadow-xl disabled:opacity-65 motion-reduce:hover:translate-y-0"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <span
                  className="size-4 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                  aria-hidden="true"
                />
                {t("register.creating")}
              </>
            ) : (
              t("register.complete")
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}
