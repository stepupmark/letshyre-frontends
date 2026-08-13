import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import Button from "../ui/button/Button";

import { useVerifyOtp } from "../../hooks/useAuth";
import { toast } from "sonner";

type FormData = {
  otp: string;
};

const OTP_LENGTH = 6;
const RESEND_TIME = 60;

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

export type AuthState = {
  email: string;
  otp_session_key: string;
};

type OtpVerificationFormProps = {
  authState: AuthState;
  onOtpVerified: () => void;
};

export default function OtpVerificationForm({
  authState,
  onOtpVerified,
}: OtpVerificationFormProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [timer, setTimer] = useState(RESEND_TIME);
  const [shake, setShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: { otp: "" },
  });

  const otp = watch("otp") || "";

  // focus first input
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // resend timer
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const { mutate, isPending } = useVerifyOtp();

  const onSubmit = (data: FormData) => {
    mutate(
      {
        email: authState.email,
        otp: data.otp,
        otp_session_key: authState.otp_session_key,
        otp_type: "Forgot Password",
      },
      {
        onSuccess: () => {
          onOtpVerified();
          reset();
          toast.success("Otp Verified Successfully");
          setErrorMessage("");
        },
        onError: (error: any) => {
          setShake(true);
          setTimeout(() => setShake(false), 400);
          toast.error(error?.response?.data?.message || "Something went wrong");
          setErrorMessage(
            error?.response?.data?.message || "Something went wrong",
          );

          setValue("otp", "");
          inputsRef.current[0]?.focus();
        },
      },
    );
  };

  // auto submit
  useEffect(() => {
    if (otp.length === OTP_LENGTH) {
      onSubmit({ otp });
    }
  }, [otp]);

  const updateOtp = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const otpArray = otp.split("").concat(Array(OTP_LENGTH).fill(""));
    otpArray[index] = value;

    const newOtp = otpArray.join("").slice(0, OTP_LENGTH);
    setValue("otp", newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (errorMessage) setErrorMessage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        updateOtp("", index);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    setValue("otp", paste);
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Code sent to{" "}
          <span className="font-medium text-gray-700">
            {maskEmail(authState.email)}
          </span>
        </p>
      </div>

      {/* OTP Inputs */}
      <div
        className={`flex gap-2 mb-8 justify-evenly ${
          shake ? "animate-[shake_0.3s]" : ""
        }`}
      >
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            value={otp[index] || ""}
            onChange={(e) => updateOtp(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            ref={(el) => (inputsRef.current[index] = el)}
            className="text-lg font-semibold text-center transition-all border border-gray-300 rounded-lg outline-none size-12 focus:border-black focus:ring-1 focus:ring-black"
          />
        ))}
      </div>

      {errorMessage && (
        <p className="mb-4 -mt-4 text-sm text-center text-red-500">
          {errorMessage}
        </p>
      )}

      {/* Submit fallback */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Button
          type="submit"
          disabled={otp.length !== OTP_LENGTH || isPending}
          className="w-full text-white bg-black h-11"
        >
          {isPending ? "Verifying..." : "Verify"}
        </Button>
      </form>

      {/* Resend */}
      <p className="mt-6 text-sm text-center text-gray-500">
        Didn’t receive the code?{" "}
        {timer > 0 ? (
          <span className="text-gray-400">Resend in {timer}s</span>
        ) : (
          <span
            className="font-medium text-gray-900 cursor-pointer hover:underline"
            onClick={() => setTimer(RESEND_TIME)}
          >
            Resend
          </span>
        )}
      </p>

      {/* animation keyframes */}
      <style jsx>{`
        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          50% {
            transform: translateX(4px);
          }
          75% {
            transform: translateX(-4px);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
