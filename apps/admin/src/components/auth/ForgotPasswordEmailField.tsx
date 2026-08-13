import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router";
import { toast } from "sonner";

import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";

import { useSendOtp } from "../../hooks/useAuth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordEmailField({
  onOtpSent,
}: {
  onOtpSent: (data: { email: string; otp_session_key: string }) => void;
}) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  const [apiResponseErrorMessage, setApiResponseErrorMessage] =
    useState<string>("");

  const { mutate, isPending } = useSendOtp();

  const onSubmit = (data: FormData) => {
    mutate(
      {
        email: data.email,
        otp_type: "Forgot Password",
      },
      {
        onSuccess: (response: { data: { otp_session_key: string } }) => {
          const otpSessionKey = response?.data?.otp_session_key;

          onOtpSent({
            otp_session_key: otpSessionKey,
            email: data.email,
          });

          reset();
          toast.success("Otp Sent Successfully");
          setApiResponseErrorMessage("");
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Something went wrong");
          setApiResponseErrorMessage(
            error?.response?.data?.message || "Something went wrong",
          );
        },
      },
    );
  };

  return (
    <div className="w-full max-w-md">
      {/* subtle top accent */}
      <div className="w-12 h-1 mb-8 bg-black rounded-full" />

      {/* heading */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900">
          Forgot password
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your email to receive a verification code.
        </p>
      </div>

      {/* form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label>Email address</Label>

          <Input
            {...register("email")}
            placeholder="you@example.com"
            error={!!errors.email}
            hint={errors.email?.message}
            className="transition-all bg-white border-gray-200 focus:border-black"
          />
        </div>

        {apiResponseErrorMessage && (
          <p className="mt-1 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
            {apiResponseErrorMessage}
          </p>
        )}

        <Button
          type="submit"
          disabled={!isValid || isPending}
          className="w-full h-11 text-sm font-medium bg-black text-white hover:bg-gray-900 active:scale-[0.98] transition-all"
        >
          {isPending ? "Sending..." : "Continue"}
        </Button>
      </form>

      {/* divider */}
      <div className="flex items-center gap-4 my-10">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-500">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* secondary action */}
      <Link to="/">
        <Button
          variant="outline"
          className="w-full h-11 text-sm font-medium hover:bg-gray-200 active:scale-[0.98] transition-all"
        >
          Back to login
        </Button>
      </Link>
    </div>
  );
}
