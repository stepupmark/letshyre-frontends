import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, CreditCard, Save, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";

import Button from "../../components/legacy-ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import {
  PaymentGateway,
  paymentsGatewaySchema,
} from "../../schemas/paymentsGateway.schema";
import { useAddPaymentGateway } from "../../hooks/usePaymentGateways";
import { toast } from "sonner";
import { getErrorMessage } from "~/lib/api/api-error";

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
    mutate(data, {
      onSuccess: () => {
        toast.success("Payment Gateway added successfully");
        reset();
      },
      onError: (error: Error) => {
        toast.error(getErrorMessage(error, "Something went wrong"));
      },
    });
  };

  return (
    <div className="bg-muted/50">
      <div className="max-w-6xl">
        <div className="mb-5 flex items-center gap-3 text-sm">
          <Link
            to="/dashboard/payment-gateways"
            className="flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
          >
            <ChevronLeft size={15} />
            Back to Gateways
          </Link>

          <span className="text-muted-foreground/70">/</span>

          <span className="font-medium text-foreground">Add Gateway</span>
        </div>

        <div className="mb-5 flex items-center gap-4 border-b border-border pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            <CreditCard size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Add Payment Gateway
            </h1>

            <p className="text-sm text-muted-foreground">
              Configure credentials and environment.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
            <div className="col-span-12 lg:col-span-3">
              <h2 className="text-lg font-semibold text-foreground">
                Gateway Details
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Provider info & visibility.
              </p>
            </div>

            <div className="col-span-12 space-y-5 lg:col-span-9">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Gateway Name</Label>

                  <select
                    {...register("gatewayName")}
                    className="mt-2 h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm text-foreground focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
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

                <div>
                  <Label>Display Name</Label>

                  <div className="mt-2">
                    <Input
                      {...register("displayName")}
                      placeholder="Display name"
                      error={!!errors.displayName}
                      hint={errors.displayName?.message}
                      className="dark:border-border dark:bg-card dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Enable Gateway
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Make available for payments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setValue("isActive", !isActive)}
                  className={`relative h-7 w-12 rounded-full transition ${
                    isActive ? "bg-emerald-500" : "bg-input"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-card transition ${
                      isActive ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
            <div className="col-span-12 lg:col-span-3">
              <h2 className="text-lg font-semibold text-foreground">
                Payment Mode
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Select processing environment.
              </p>
            </div>

            <div className="col-span-12 grid gap-3 md:grid-cols-2 lg:col-span-9">
              <button
                type="button"
                onClick={() => setValue("environment", "sandbox")}
                className={`min-h-[40px] rounded-2xl border px-4 py-1.5 text-left transition ${
                  environment === "sandbox"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">Sandbox</p>

                  {environment === "sandbox" && (
                    <CheckCircle2 size={16} className="text-blue-500" />
                  )}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Test transactions
                </p>
              </button>

              <button
                type="button"
                onClick={() => setValue("environment", "live")}
                className={`min-h-[40px] rounded-2xl border px-4 text-left transition ${
                  environment === "live"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">Live</p>

                  {environment === "live" && (
                    <CheckCircle2 size={16} className="text-blue-500" />
                  )}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Real payments
                </p>
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
            <div className="col-span-12 lg:col-span-3">
              <h2 className="text-lg font-semibold text-foreground">
                Credentials
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Secure access keys.
              </p>
            </div>

            <div className="col-span-12 grid gap-4 md:grid-cols-2 lg:col-span-9">
              <div>
                <Label>API Key / Client ID</Label>

                <div className="mt-2">
                  <Input
                    {...register("clientId")}
                    placeholder="Enter API key"
                    error={!!errors.clientId}
                    hint={errors.clientId?.message}
                    className="dark:border-border dark:bg-card dark:text-white"
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
                    className="dark:border-border dark:bg-card dark:text-white"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="mt-4 flex items-center justify-center gap-4 border-t border-border">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 ml-auto h-11 w-1/3 rounded-2xl"
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
