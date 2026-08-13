import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { useResetPassword } from "../../hooks/useAuth";
import { useNavigate } from "react-router";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[0-9]/, "At least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordForm({ email }: { email: string }) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setFocus,
    formState: { errors, isValid, touchedFields },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const password = watch("password");
  const navigate = useNavigate();

  useEffect(() => {
    setFocus("password");
  }, [setFocus]);

  const { mutate, isPending } = useResetPassword();

  const onSubmit = (data: FormData) => {
    mutate(
      {
        email: email,
        new_password: data.password,
        confirm_password: data.confirmPassword,
      },
      {
        onSuccess: (response: {
          data: { success: boolean; message: string };
        }) => {
          if (response?.data?.success) {
            reset();
            toast.success("Password reset successfully");
            setServerError(null);
            navigate("/");
          } else {
            const message = response?.data?.message || "Something went wrong";
            setServerError(message);
            toast.error(message);
          }
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Something went wrong");
          setServerError(
            error?.response?.data?.message || "Something went wrong",
          );
        },
      },
    );
  };

  // password strength checks
  const checks = [
    { label: "At least 8 characters", valid: password?.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password || "") },
    { label: "One number", valid: /[0-9]/.test(password || "") },
  ];

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900">
          Create new password
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Choose a strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Password */}
        <div className="space-y-2">
          <Label>New password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Enter new password"
              error={!!errors.password && touchedFields.password}
              hint={errors.password?.message}
              required
              rightIcon={
                <span onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeIcon className="cursor-pointer fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="cursor-pointer fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              }
            />
          </div>

          {/* live rules */}
          <div className="mt-2 space-y-1 text-xs">
            {checks.map((check, i) => (
              <p
                key={i}
                className={`flex items-center gap-2 ${
                  check.valid ? "text-green-600" : "text-gray-400"
                }`}
              >
                <span>{check.valid ? "✓" : "•"}</span>
                {check.label}
              </p>
            ))}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label>Confirm password</Label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Re-enter password"
              error={!!errors.confirmPassword && touchedFields.confirmPassword}
              hint={errors.confirmPassword?.message}
              rightIcon={
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeIcon className="cursor-pointer fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="cursor-pointer fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              }
            />
          </div>
        </div>

        {/* Server Error */}
        {serverError && (
          <p className="text-sm text-center text-red-500">{serverError}</p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={!isValid || isPending}
          className="w-full text-white bg-black h-11"
        >
          {isPending ? "Updating..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
