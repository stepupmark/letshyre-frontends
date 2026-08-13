
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  changePasswordSchema,
  ChangePasswordInput,
} from "../../schemas/changePassword.schema";
import { useChangePassword } from "../../hooks/useAuth";

export const ChangePasswordForm = ({
  closeChangePasswordModal,
}: {
  closeChangePasswordModal: () => void;
}) => {
  const { mutate, isPending } = useChangePassword();

  // State for toggling password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [apiErrorMessage, setApiResponseErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordInput) => {
    mutate(
      {
        old_password: data.currentPassword,
        new_password: data.newPassword,
      },
      {
        onSuccess: () => {
          reset();
          toast.success("Password Updated Successfully");
          closeChangePasswordModal();
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
    <div className="w-full">
      <div className="px-2 pb-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Current Password
            </label>
            <div className="relative group">
              <div className="absolute transition-colors duration-200 -translate-y-1/2 left-3 top-1/2 text-slate-400 group-focus-within:text-black">
                <Lock size={18} />
              </div>
              <input
                type={showCurrent ? "text" : "password"}
                {...register("currentPassword")}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border ${
                  errors.currentPassword
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-slate-200"
                } rounded-xl outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              New Password
            </label>
            <div className="relative group">
              <div className="absolute transition-colors duration-200 -translate-y-1/2 left-3 top-1/2 text-slate-400 group-focus-within:text-black">
                <Lock size={18} />
              </div>
              <input
                type={showNew ? "text" : "password"}
                {...register("newPassword")}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border ${
                  errors.newPassword
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-slate-200"
                } rounded-xl outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Confirm New Password
            </label>
            <div className="relative group">
              <div className="absolute transition-colors duration-200 -translate-y-1/2 left-3 top-1/2 text-slate-400 group-focus-within:text-black">
                <Lock size={18} />
              </div>
              <input
                type={showConfirm ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                  errors.confirmPassword
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-slate-200"
                } rounded-xl outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                {errors.confirmPassword.message}
              </p>
            )}
            {apiErrorMessage && (
              <p className="mt-1 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                {apiErrorMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-black rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-black/10"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
