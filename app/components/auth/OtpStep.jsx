import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useOtpInput } from "@/hooks/useOtpInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveAuthErrorKey, isSessionExpiredKey } from "@/lib/authErrorMessages";

const OTP_BOX_CLASS =
  "h-13 w-12 rounded-md border-[1.5px] border-border bg-card text-center text-2xl md:text-2xl font-bold text-text-main shadow-none focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-brand-600/12";

// Shared OTP screen for register (email + mobile) and forgot-password. Owns the
// session key locally so a resend can swap it in. When `destination` is given
// it's shown with a "change it" link (onEditContact) to fix a wrong contact.
export function OtpStep({
  title,
  subtitle,
  helpText,
  destination,
  onEditContact,
  sessionKey: initialSessionKey,
  verifyMutation,
  resendMutation,
  makeVerifyVars,
  makeResendVars,
  onVerified,
}) {
  const { t } = useTranslation("auth");
  const [sessionKey, setSessionKey] = useState(initialSessionKey);
  const { length, value, isComplete, timer, reset, getInputProps } =
    useOtpInput();
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const MAX_ATTEMPTS = 5;
  const isLocked = attempts >= MAX_ATTEMPTS;

  // Guards auto-submit so the same code isn't re-verified on every render.
  const lastSubmitted = useRef("");

  const submit = () => {
    if (isLocked) return;
    lastSubmitted.current = value;
    verifyMutation.mutate(makeVerifyVars({ otp: value, sessionKey }), {
      onSuccess: () => {
        setErrorMessage("");
        onVerified();
      },
      onError: (error) => {
        const key = resolveAuthErrorKey(error, { fallback: "toast.otpInvalid" });
        setErrorMessage(t(key));
        if (isSessionExpiredKey(key)) {
          reset();
          lastSubmitted.current = "";
        } else {
          setAttempts((prev) => prev + 1);
        }
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLocked) return;
    if (!isComplete) {
      toast.error(t("otp.enterDigits", { count: length }));
      return;
    }
    setErrorMessage("");
    submit();
  };

  // Auto-verify once all digits are entered (typed or pasted). Re-runs only
  // when the code changes, so a rejected code isn't retried until it's edited.
  useEffect(() => {
    if (!isComplete || isLocked) return;
    if (verifyMutation.isPending) return;
    if (lastSubmitted.current === value) return;
    submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, value, verifyMutation.isPending]);

  const handleResend = () => {
    if (resendMutation.isPending) return;
    resendMutation.mutate(makeResendVars(), {
      onSuccess: (res) => {
        if (res?.otpSessionKey) setSessionKey(res.otpSessionKey);
        reset();
        setAttempts(0);
        setErrorMessage("");
        lastSubmitted.current = "";
        toast.success(t("otp.resent"));
      },
    });
  };

  return (
    <>
      <h1 className="mt-0 mb-8 text-center text-[clamp(1.5rem,1.3rem_+_1vw,1.875rem)] leading-[1.2] font-extrabold text-text-main">{title}</h1>
      {subtitle && <p className="-mt-6 mb-6 text-center text-sm leading-[1.6] text-neutral-500">{subtitle}</p>}

      {destination && (
        <p className="-mt-4 mb-6 text-center text-sm leading-[1.6] text-neutral-500">
          {t("otp.sentTo")}{" "}
          <span className="font-bold break-words text-text-main">
            {destination}
          </span>
          {onEditContact && (
            <>
              {" — "}
              <Button
                type="button"
                className="h-auto bg-transparent p-0 text-sm font-semibold text-brand-600 hover:bg-transparent hover:text-brand-700 hover:underline hover:underline-offset-2"
                onClick={onEditContact}
              >
                {t("otp.changeIt")}
              </Button>
            </>
          )}
        </p>
      )}

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {errorMessage && (
          <p role="alert" className="-mt-2 text-center text-sm font-medium text-danger">
            {errorMessage}
          </p>
        )}

        <div className="flex justify-center gap-2.5 max-sm:gap-1.5">
          {Array.from({ length }).map((_, i) => (
            <Input key={i} type="text" disabled={isLocked || verifyMutation.isPending} className={OTP_BOX_CLASS} {...getInputProps(i)} />
          ))}
        </div>

        {helpText && <p className={cn("m-0 text-start text-sm text-neutral-500", "text-center")}>{helpText}</p>}

        <Button
          className="mt-2 h-auto w-full rounded-full border-0 bg-text-main px-6 py-4 text-base font-bold text-white shadow-lg transition-all duration-150 hover:-translate-y-px hover:bg-text-main hover:shadow-xl disabled:opacity-65 motion-reduce:hover:translate-y-0"
          type="submit"
          disabled={verifyMutation.isPending || isLocked}
        >
          {verifyMutation.isPending ? (
            <>
              <span className="size-4 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" aria-hidden="true" />
              {t("otp.verifying")}
            </>
          ) : isLocked ? (
            t("otp.tooManyAttempts")
          ) : (
            t("otp.verifyContinue")
          )}
        </Button>
      </form>

      <p className="mt-2 text-center text-sm leading-[1.9] text-neutral-500">
        {t("otp.noCode")}
        <br />
        {timer > 0 ? (
          <>
            {t("otp.resendIn")}{" "}
            <span className="font-bold text-brand-600">
              00:{String(timer).padStart(2, "0")}
            </span>
          </>
        ) : (
          <Button
            type="button"
            className={`${"h-auto bg-transparent p-0 text-sm font-semibold text-brand-600 hover:bg-transparent hover:text-brand-700 hover:underline hover:underline-offset-2"} ${"text-base font-bold"}`}
            onClick={handleResend}
            disabled={resendMutation.isPending}
          >
            {resendMutation.isPending ? t("otp.resending") : t("otp.resend")}
          </Button>
        )}
      </p>
    </>
  );
}
