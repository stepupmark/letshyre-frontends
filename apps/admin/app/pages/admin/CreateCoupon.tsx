import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/legacy-ui/button/Button";
import { useCreateCoupon } from "../../hooks/useCoupons";
import { CouponFormValues, couponSchema } from "../../schemas/coupon.schema";

export default function CreateCoupon() {
  const navigate = useNavigate();
  const { mutate: createCoupon, isPending } = useCreateCoupon();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      discount_type: "flat",
      discount_value: "",
      usage_limit: "",
      start_date: "",
      end_date: "",
    },
  });

  const discountType = watch("discount_type");

  const onSubmit = (data: CouponFormValues) => {
    const formattedData = {
      ...data,
      code: data.code.toUpperCase(),
      usage_limit: Number(data.usage_limit),
      start_date: new Date(data.start_date).toISOString(),
      end_date: new Date(data.end_date).toISOString(),
    };

    createCoupon(formattedData, {
      onSuccess: () => {
        navigate("/dashboard/coupons");
      },
    });
  };

  return (
    <>
      <PageMeta
        title="LetsHyre Admin – Create Coupon"
        description="Create a new discount coupon."
      />

      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <button
            onClick={() => navigate("/dashboard/coupons")}
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Coupons
          </button>

          <span className="text-muted-foreground/70">/</span>

          <span className="font-medium text-foreground">
            Create Coupon
          </span>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold tracking-wide uppercase text-primary">
            Coupon Management
          </p>

          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            Create New Coupon
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Generate discount coupons for campaigns, onboarding offers, and
            promotional events.
          </p>
        </div>

        <div className="p-6 bg-card border border-border shadow-xs rounded-3xl sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            <section>
              <h2 className="mb-5 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Coupon Basics
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className="block mb-2 text-sm font-medium text-foreground">
                    Coupon Code <span className="text-destructive">*</span>
                  </label>

                  <input
                    type="text"
                    {...register("code")}
                    placeholder="WELCOME50"
                    className="w-full px-4 py-3 text-sm font-semibold tracking-widest text-foreground uppercase transition-all duration-200 bg-card border border-input outline-hidden rounded-2xl placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/50"
                  />

                  {errors.code ? (
                    <p className="mt-2 text-xs text-destructive">
                      {errors.code.message}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Use memorable codes like WELCOME50 or SUMMER25
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">
                    Usage Limit <span className="text-destructive">*</span>
                  </label>

                  <input
                    type="number"
                    {...register("usage_limit")}
                    min="1"
                    placeholder="Maximum uses"
                    className="w-full px-4 py-3 text-sm text-foreground transition-all duration-200 bg-card border border-input outline-hidden rounded-2xl placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/50"
                  />

                  {errors.usage_limit && (
                    <p className="mt-2 text-xs text-destructive">
                      {errors.usage_limit.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-5 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Discount Setup
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">
                    Discount Type <span className="text-destructive">*</span>
                  </label>

                  <select
                    {...register("discount_type")}
                    className="w-full px-4 py-3 text-sm text-foreground transition-all duration-200 bg-card border border-input outline-hidden rounded-2xl focus:border-ring focus:ring-4 focus:ring-ring/50"
                  >
                    <option value="flat">Flat Amount</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Flat = fixed amount, Percentage = % off
                  </p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">
                    Discount Value <span className="text-destructive">*</span>
                  </label>

                  <input
                    type="number"
                    {...register("discount_value")}
                    step="0.01"
                    min="0"
                    placeholder={
                      discountType === "flat"
                        ? "Enter flat amount"
                        : "Enter percentage"
                    }
                    className="w-full px-4 py-3 text-sm text-foreground transition-all duration-200 bg-card border border-input outline-hidden rounded-2xl placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/50"
                  />

                  {errors.discount_value && (
                    <p className="mt-2 text-xs text-destructive">
                      {errors.discount_value.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-5 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Validity Period
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">
                    Start Date & Time <span className="text-destructive">*</span>
                  </label>

                  <input
                    type="datetime-local"
                    {...register("start_date")}
                    className="w-full px-4 py-3 text-sm text-foreground transition-all duration-200 bg-card border border-input outline-hidden rounded-2xl focus:border-ring focus:ring-4 focus:ring-ring/50"
                  />

                  {errors.start_date && (
                    <p className="mt-2 text-xs text-destructive">
                      {errors.start_date.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground">
                    End Date & Time <span className="text-destructive">*</span>
                  </label>

                  <input
                    type="datetime-local"
                    {...register("end_date")}
                    className="w-full px-4 py-3 text-sm text-foreground transition-all duration-200 bg-card border border-input outline-hidden rounded-2xl focus:border-ring focus:ring-4 focus:ring-ring/50"
                  />

                  {errors.end_date && (
                    <p className="mt-2 text-xs text-destructive">
                      {errors.end_date.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <div className="sticky bottom-0 pt-6 border-t border-border bg-card/90 backdrop-blur-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Review all coupon details before publishing.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/coupons")}
                    className="rounded-xl border border-input px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
                  >
                    Cancel
                  </button>

                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating..." : "Create Coupon"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
