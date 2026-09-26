import { useEffect, useState } from "react";
import { Eye, EyeOff, Copy, Check, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../../components/legacy-ui/button/Button";
import { Modal } from "../../components/legacy-ui/modal/model2";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import DeleteGatewayModal from "./DeleteGatewayModal";
import {
  PaymentGateway,
  paymentsGatewaySchema,
} from "../../schemas/paymentsGateway.schema";
import {
  Gateway,
  useDeletePaymentGateway,
  usePaymentGatewayDetail,
  useUpdatePaymentGateway,
} from "../../hooks/usePaymentGateways";

export default function GatewayCard({ gateway }: { gateway: Gateway }) {
  const [showSecret, setShowSecret] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copied, setCopied] = useState<"id" | "secret" | null>(null);
  const [id, setId] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
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

  const { data } = usePaymentGatewayDetail(id, isEditModalOpen);

  const copy = async (value: string, type: "id" | "secret") => {
    await navigator.clipboard.writeText(value);
    setCopied(type);

    setTimeout(() => setCopied(null), 1200);
  };

  const mask = (value: string) => value.slice(0, 15) + "••••••••••••";

  const { mutate, isPending } = useUpdatePaymentGateway();

  const { isPending: deleteIsPending } = useDeletePaymentGateway();

  const onSubmit = (data: PaymentGateway) => {
    console.log(data);

    mutate(
      { ...data, id },
      {
        onSuccess: () => {
          toast.success("Payment Gateway updated successfully");
          reset();
          setIsEditModalOpen((prev) => !prev);
          setId("");
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.data.message || "Something went wrong",
          );
        },
      },
    );
  };

  useEffect(() => {
    if (!data) return;

    reset({
      gatewayName: data?.name,
      displayName: data.displayName,
      clientId: data.clientId,
      clientSecret: data.clientSecret,
      environment: data.isSandbox ? "sandbox" : "live",
      isActive: true,
    });
  }, [data, id, reset]);

  return (
    <div className="p-5 transition-all duration-200 bg-card border border-border shadow-xs rounded-3xl hover:border-input hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center min-w-0 gap-3">
          <div className="flex items-center justify-center text-sm font-semibold text-foreground bg-muted size-11 shrink-0 rounded-2xl">
            {gateway.displayName.charAt(0)}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {gateway.displayName}
            </h3>

            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {gateway.name}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            gateway.isSandbox
              ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          }`}
        >
          {gateway.isSandbox ? "Sandbox" : "Production"}
        </span>
      </div>

      <div className="h-px my-4 bg-muted" />

      <div className="space-y-3">
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-muted/50">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Client ID
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {mask(gateway.clientId)}
            </p>
          </div>

          <button
            onClick={() => copy(gateway.clientId, "id")}
            aria-label="Copy client ID"
            className="p-2 text-muted-foreground transition rounded-xl hover:bg-accent hover:text-foreground"
          >
            {copied === "id" ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>

        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-muted/50">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Client Secret
            </p>

            <p className="mt-1 text-sm font-medium text-foreground">
              {showSecret ? gateway.clientSecret : "••••••••••••"}
            </p>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setShowSecret((prev) => !prev)}
              aria-label={showSecret ? "Hide client secret" : "Show client secret"}
              className="p-2 text-muted-foreground transition rounded-xl hover:bg-accent hover:text-foreground"
            >
              {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>

            <button
              onClick={() => copy(gateway.clientSecret, "secret")}
              aria-label="Copy client secret"
              className="p-2 text-muted-foreground transition rounded-xl hover:bg-accent hover:text-foreground"
            >
              {copied === "secret" ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-muted-foreground">
          Secure payment credentials
        </p>
        <div className="space-x-5">
          <Button
            variant="outline"
            className="px-4 text-sm h-9 rounded-2xl dark:border-border dark:bg-muted dark:text-white dark:hover:bg-muted"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={deleteIsPending}
            aria-label="Delete payment gateway"
          >
            <span className="mr-2">
              <Trash2 size={14} className="text-red-500" />
            </span>
            {deleteIsPending ? "Deleting..." : "Delete"}
          </Button>
          <Button
            onClick={() => {
              setIsEditModalOpen(true);
              setId(gateway.id);
            }}
            variant="outline"
            className="px-4 text-sm h-9 rounded-2xl dark:border-border dark:bg-muted dark:text-white dark:hover:bg-muted"
            aria-label="Edit payment gateway"
          >
            <span className="mr-2">
              <Pencil size={14} />
            </span>
            Edit
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="max-w-2xl p-0 overflow-hidden bg-card border border-border"
      >
        <div className="px-6 py-5 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            Edit Payment Gateway
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Update credentials and environment settings.
          </p>
        </div>

        <div className="flex max-h-[80vh] flex-col overflow-hidden bg-card">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 px-6 py-6 overflow-y-auto"
          >
            <div className="space-y-5">
              <section className="rounded-2xl border border-border bg-muted/50 p-5 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-foreground">
                    Gateway Details
                  </h4>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Provider identity and visibility.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label className="dark:text-foreground">Gateway Name</Label>

                    <select
                      {...register("gatewayName")}
                      className="w-full px-4 mt-2 text-sm text-foreground bg-card border border-input h-11 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="paypal">PayPal</option>
                      <option value="razorpay">Razorpay</option>
                      <option value="stripe">Stripe</option>
                    </select>
                  </div>

                  <div>
                    <Label className="dark:text-foreground">Display Name</Label>

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

                <div className="flex items-center justify-between px-4 py-3 mt-5 bg-card border border-border rounded-2xl">
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
                      isActive
                        ? "bg-emerald-500"
                        : "bg-input"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-card transition ${
                        isActive ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-5">
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      Payment Mode
                    </h4>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Select environment.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setValue("environment", "sandbox")}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        environment === "sandbox"
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/20 dark:bg-blue-500/10"
                          : "border-border bg-card hover:bg-accent"
                      }`}
                    >
                      <p className="font-medium text-foreground">
                        Sandbox
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Test mode
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setValue("environment", "live")}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        environment === "live"
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/20 dark:bg-blue-500/10"
                          : "border-border bg-card hover:bg-accent"
                      }`}
                    >
                      <p className="font-medium text-foreground">
                        Live
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Production mode
                      </p>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-5 md:grid-cols-2">
                  <div>
                    <Label className="dark:text-foreground">API Key</Label>

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
                    <Label className="dark:text-foreground">Secret Key</Label>

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
            </div>
          </form>

          <div className="px-6 py-4 bg-card border-t border-border shrink-0">
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isPending}
              className="w-full h-11 rounded-2xl"
            >
              {isPending ? "Saving..." : "Save Gateway"}
            </Button>
          </div>
        </div>
      </Modal>

      <DeleteGatewayModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        gateway={isDeleteModalOpen ? gateway : null}
      />
    </div>
  );
}
