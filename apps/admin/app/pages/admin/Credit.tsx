"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useCredit, useUpdateCredit } from "../../hooks/useCredit";

import Label from "../../components/form/Label";
import Button from "../../components/legacy-ui/button/Button";
import CreditSkeleton from "../../components/Skeletons/CreditSkeleton";
import {
  CreditFormValues,
  creditSchema,
} from "../../schemas/credit.schema";

const formatCurrency = (value: string | number) => {
  if (!value) return "₹ 0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(value));
};

export default function CreditSetup() {
  const { data, isLoading } = useCredit();
  const { mutate, isPending } = useUpdateCredit();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreditFormValues>({
    resolver: zodResolver(creditSchema),
    defaultValues: {
      creditValue: "",
    },
  });

  const value = watch("creditValue");

  const [isSaved, setIsSaved] = useState(false);
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (data) {
      reset({ creditValue: data.creditValue || "" });
      setDisplayValue(data.creditValue || "0");
    }
  }, [data, reset]);

  useEffect(() => {
    if (!data?.creditValue) return;

    let start = Number(displayValue || 0);
    const end = Number(data.creditValue);
    const duration = 300;

    const startTime = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const current = start + (end - start) * progress;

      setDisplayValue(current.toFixed(2));

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [data?.creditValue]);

  const onSubmit = (formData: CreditFormValues) => {
    if (!data?.id) return;

    mutate(
      { id: data.id, creditValue: formData.creditValue },
      {
        onSuccess: () => {
          setIsSaved(true);
          toast.success("Credit updated");
          reset({ creditValue: formData.creditValue });

          setTimeout(() => setIsSaved(false), 2000);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.data.credit_value || "Something went wrong",
          );
        },
      },
    );
  };
  if (isLoading) return <CreditSkeleton />;

  return (
    <div className="bg-muted/50">
      <div className="max-w-6xl mx-auto 2xl:w-full ">
        <div className="flex items-end justify-between gap-6 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Credit Pricing
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Manage how much employers pay for credits used to unlock candidate
              profiles.
            </p>
          </div>

          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!value || !isDirty || isPending}
            className="px-6 text-sm font-medium h-11"
          >
            {isPending ? "Updating..." : "Save Changes"}
          </Button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-12 gap-10 py-10"
        >
          <div className="col-span-12 lg:col-span-4">
            <h2 className="text-lg font-semibold text-foreground">
              Pricing Settings
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Employers purchase credits to access candidate profiles. One
              credit unlocks one candidate profile.
            </p>

            <div className="p-5 mt-6 bg-card border border-border rounded-2xl">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Credit Rule
              </p>

              <p className="mt-2 text-xl font-semibold text-foreground">
                1 Credit = 1 Candidate Unlock
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                One credit gives access to one candidate profile.
              </p>
            </div>
          </div>

          <div className="col-span-12 space-y-8 lg:col-span-8">
            <div className="px-6 py-5 bg-card border border-border rounded-2xl">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Current Price Per Credit
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {formatCurrency(displayValue)}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Amount employers currently pay for each candidate.
              </p>
            </div>

            <div className="space-y-3">
              <Label className="dark:text-foreground">Price for 1 Credit</Label>

              <div className="relative">
                <span className="absolute text-sm text-muted-foreground -translate-y-1/2 left-4 top-1/2">
                  ₹
                </span>

                <input
                  type="number"
                  {...register("creditValue", {
                    onChange: () => setIsSaved(false),
                  })}
                  placeholder="Enter price"
                  className="w-full h-12 pl-10 pr-4 text-base font-medium text-foreground transition-all bg-card border border-input rounded-2xl focus:border-ring focus:outline-hidden focus:ring-2 focus:ring-ring/50"
                />
              </div>

              {errors.creditValue ? (
                <p className="text-sm text-red-500">
                  {errors.creditValue.message}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Example: ₹100 means employers pay ₹100 per credit.
                </p>
              )}
            </div>

            {value && Number(value) > 0 && (
              <div className="p-5 bg-card border border-border rounded-2xl">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Purchase Preview
                </p>

                <div className="grid gap-3 mt-4 sm:grid-cols-3">
                  <div className="px-4 py-3 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      10 Credits
                    </p>
                    <p className="mt-1 font-semibold text-foreground">
                      ₹{Number(value) * 10}
                    </p>
                  </div>

                  <div className="px-4 py-3 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      50 Credits
                    </p>
                    <p className="mt-1 font-semibold text-foreground">
                      ₹{Number(value) * 50}
                    </p>
                  </div>

                  <div className="px-4 py-3 rounded-xl bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      100 Credits
                    </p>
                    <p className="mt-1 font-semibold text-foreground">
                      ₹{Number(value) * 100}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-5 border-t border-border">
              {isSaved ? (
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  ✓ Pricing updated successfully
                </p>
              ) : isDirty ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  You have unsaved pricing changes
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Changes affect future employer purchases only.
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
