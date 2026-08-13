import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, CreditCard, Save, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";

import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import {
  PaymentGateway,
  paymentsGatewaySchema,
} from "../../schemas/paymentsGateway.schema";
import { useAddPaymentGateway } from "../../hooks/usePaymentGateways";
import { toast } from "sonner";

export default function AddPaymentGateway() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentGateway>({
    resolver: zodResolver(paymentsGatewaySchema),
    defaultValues: {
      gatewayName: "paypal",
      displayName: "",
      isActive: false,
      environment: "sandbox",
      clientId: "",
      clientSecret: "",
    },
  });

  const environment = watch("environment");
  const isActive = watch("isActive");

  const { mutate, isPending } = useAddPaymentGateway();

  const onSubmit = (data: PaymentGateway) => {
    console.log(data);

    mutate(data, {
      onSuccess: () => {
        toast.success("Payment Gateway added successfully");
        reset();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.data.message || "Something went wrong",
        );
      },
    });
  };

  return (
    <div className=" bg-gray-50 dark:bg-slate-900">
      <div className="max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-5 text-sm">
          <Link
            to={-1}
            className="flex items-center gap-1 text-gray-500 transition hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ChevronLeft size={15} />
            Back to Gateways
          </Link>

          <span className="text-gray-300 dark:text-slate-700">/</span>

          <span className="font-medium text-gray-900 dark:text-white">
            Add Gateway
          </span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 pb-5 mb-5 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-center w-12 h-12 text-blue-600 rounded-2xl bg-blue-50 dark:bg-blue-500/10 dark:text-blue-300">
            <CreditCard size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Add Payment Gateway
            </h1>

            <p className="text-sm text-gray-500 dark:text-slate-400">
              Configure credentials and environment.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          {/* Gateway Details */}
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
            <div className="col-span-12 lg:col-span-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Gateway Details
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Provider info & visibility.
              </p>
            </div>

            <div className="col-span-12 space-y-5 lg:col-span-9">
              {/* Same Row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Gateway Name */}
                <div>
                  <Label>Gateway Name</Label>

                  <select
                    {...register("gatewayName")}
                    className="w-full px-4 mt-2 text-sm text-gray-900 bg-white border border-gray-300 h-11 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="paypal">PayPal</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="stripe">Stripe</option>
                  </select>

                  {errors.gatewayName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.gatewayName.message}
                    </p>
                  )}
                </div>

                {/* Display Name */}
                <div>
                  <Label>Display Name</Label>

                  <div className="mt-2">
                    <Input
                      {...register("displayName")}
                      placeholder="Display name"
                      error={!!errors.displayName}
                      hint={errors.displayName?.message}
                      className="dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-white border border-gray-200 rounded-2xl dark:border-slate-700 dark:bg-slate-900">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Enable Gateway
                  </p>

                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Make available for payments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setValue("isActive", !isActive)}
                  className={`relative h-7 w-12 rounded-full transition ${
                    isActive
                      ? "bg-emerald-500"
                      : "bg-gray-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                      isActive ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Payment Mode */}
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
            <div className="col-span-12 lg:col-span-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Mode
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Select processing environment.
              </p>
            </div>

            <div className="grid col-span-12 gap-3 md:grid-cols-2 lg:col-span-9">
              {/* Sandbox */}
              <button
                type="button"
                onClick={() => setValue("environment", "sandbox")}
                className={`rounded-2xl border px-4 py-1.5 text-left transition min-h-[40px] ${
                  environment === "sandbox"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                    : "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Sandbox
                  </p>

                  {environment === "sandbox" && (
                    <CheckCircle2 size={16} className="text-blue-500" />
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
                  Test transactions
                </p>
              </button>

              {/* Live */}
              <button
                type="button"
                onClick={() => setValue("environment", "live")}
                className={`rounded-2xl border px-4  text-left transition min-h-[40px] ${
                  environment === "live"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                    : "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Live
                  </p>

                  {environment === "live" && (
                    <CheckCircle2 size={16} className="text-blue-500" />
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
                  Real payments
                </p>
              </button>
            </div>
          </section>

          {/* Credentials */}
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
            <div className="col-span-12 lg:col-span-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Credentials
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Secure access keys.
              </p>
            </div>

            <div className="grid col-span-12 gap-4 md:grid-cols-2 lg:col-span-9">
              <div>
                <Label>API Key / Client ID</Label>

                <div className="mt-2">
                  <Input
                    {...register("clientId")}
                    placeholder="Enter API key"
                    error={!!errors.clientId}
                    hint={errors.clientId?.message}
                    className="dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Label>API Secret / Client Secret</Label>

                <div className="mt-2">
                  <Input
                    type="password"
                    {...register("clientSecret")}
                    placeholder="Enter secret key"
                    error={!!errors.clientSecret}
                    hint={errors.clientSecret?.message}
                    className="dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="flex items-center justify-center gap-4 mt-4 border-t border-gray-200 dark:border-slate-800">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-1/3 mt-5 ml-auto h-11 rounded-2xl"
            >
              <span className="mr-2">
                <Save size={16} />
              </span>

              {isPending ? "Saving..." : "Save Gateway"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
