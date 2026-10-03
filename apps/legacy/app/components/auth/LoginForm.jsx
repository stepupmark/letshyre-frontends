import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router";
import { Mail } from "lucide-react";
import { useLoginMutation } from "@/hooks/useAuth";
import { resolveLoginErrorKey } from "@/lib/authErrorMessages";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { AuthTextField } from "./AuthTextField";
import { AuthPasswordField } from "./AuthPasswordField";

const makeLoginSchema = (t) =>
  z.object({
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    password: z.string().min(1, t("validation.passwordRequired")),
  });

export function LoginForm({ role, registerLink }) {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");

  const form = useForm({
    resolver: zodResolver(useMemo(() => makeLoginSchema(t), [t])),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useLoginMutation();

  const isBusy = mutation.isPending || mutation.isSuccess;

  const onSubmit = (data) => {
    form.clearErrors("root");
    mutation.mutate(
      { ...data, role },
      {
        onError: (error) => {
          form.setError("root", { message: t(resolveLoginErrorKey(error)) });
          form.setFocus("password");
        },
      },
    );
  };

  // Carry the role into the forgot-password flow (employer needs it).
  const forgotState =
    role === "Employer" ? { state: { role: "employer" } } : undefined;

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <AuthTextField
          name="email"
          label={t("fields.email")}
          type="email"
          icon={Mail}
          placeholder={t("placeholders.email")}
          autoComplete="email"
          inputMode="email"
          autoFocus
        />

        <AuthPasswordField
          name="password"
          label={t("fields.password")}
          autoComplete="current-password"
          capsHint
        />

        {/* FORGOT PASSWORD */}
        <div className="flex justify-end -mt-2">
          <Button
            type="button"
            className="h-auto bg-transparent p-0 text-sm font-semibold text-brand-600 hover:bg-transparent hover:text-brand-700 hover:underline hover:underline-offset-2"
            onClick={() => navigate("/forgot-password", forgotState)}
          >
            {t("login.forgot")}
          </Button>
        </div>

        {form.formState.errors.root?.message && (
          <p role="alert" className="-mt-2 text-sm font-medium text-danger">
            {form.formState.errors.root.message}
          </p>
        )}

        {/* SUBMIT */}
        <Button
          className="mt-2 h-auto w-full rounded-full border-0 bg-text-main px-6 py-4 text-base font-bold text-white shadow-lg transition-all duration-150 hover:-translate-y-px hover:bg-text-main hover:shadow-xl disabled:opacity-65 motion-reduce:hover:translate-y-0"
          type="submit"
          disabled={isBusy}
        >
          {isBusy ? (
            <>
              <span
                className="size-4 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                aria-hidden="true"
              />
              {mutation.isSuccess
                ? t("login.redirecting")
                : t("login.loggingIn")}
            </>
          ) : (
            t("login.submit")
          )}
        </Button>

        {/* REGISTER CTA */}
        <p className="mt-2 text-center text-sm leading-[1.9] text-neutral-500">
          {t("login.noAccount")}
          <br />
          <Link
            to={registerLink}
            className={cn(
              "h-auto bg-transparent p-0 text-sm font-semibold text-brand-600 hover:bg-transparent hover:text-brand-700 hover:underline hover:underline-offset-2",
              "text-base font-bold",
            )}
          >
            {t("login.register")}
          </Link>
        </p>
      </form>
    </Form>
  );
}
