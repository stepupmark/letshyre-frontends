import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
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
        navigate("/dashboard/coupon-management");
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <button
            onClick={() => navigate("/dashboard/coupon-management")}
            className="inline-flex items-center gap-1.5 text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400 dark:hover:text-white"
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

          <span className="text-gray-300 dark:text-gray-600">/</span>

          <span className="font-medium text-gray-900 dark:text-white">
            Create Coupon
          </span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-wide uppercase text-brand-500">
            Coupon Management
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Create New Coupon
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Generate discount coupons for campaigns, onboarding offers, and
            promotional events.
          </p>
        </div>

        {/* Main Card */}
        <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-3xl dark:border-white/10 dark:bg-gray-dark sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Section 1 */}
            <section>
              <h2 className="mb-5 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Coupon Basics
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Coupon Code */}
                <div className="sm:col-span-1">
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Coupon Code <span className="text-error-500">*</span>
                  </label>

                  <input
                    type="text"
                    {...register("code")}
                    placeholder="WELCOME50"
                    className="w-full px-4 py-3 text-sm font-semibold tracking-widest text-gray-900 uppercase transition-all duration-200 bg-white border border-gray-300 outline-none rounded-2xl placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />

                  {errors.code ? (
                    <p className="mt-2 text-xs text-error-500">
                      {errors.code.message}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Use memorable codes like WELCOME50 or SUMMER25
                    </p>
                  )}
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Usage Limit <span className="text-error-500">*</span>
                  </label>

                  <input
                    type="number"
                    {...register("usage_limit")}
                    min="1"
                    placeholder="Maximum uses"
                    className="w-full px-4 py-3 text-sm text-gray-900 transition-all duration-200 bg-white border border-gray-300 outline-none rounded-2xl placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />

                  {errors.usage_limit && (
                    <p className="mt-2 text-xs text-error-500">
                      {errors.usage_limit.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="mb-5 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Discount Setup
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Type */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Type <span className="text-error-500">*</span>
                  </label>

                  <select
                    {...register("discount_type")}
                    className="w-full px-4 py-3 text-sm text-gray-900 transition-all duration-200 bg-white border border-gray-300 outline-none rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="flat">Flat Amount</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>

                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Flat = fixed amount, Percentage = % off
                  </p>
                </div>

                {/* Value */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Value <span className="text-error-500">*</span>
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
                    className="w-full px-4 py-3 text-sm text-gray-900 transition-all duration-200 bg-white border border-gray-300 outline-none rounded-2xl placeholder:text-gray-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />

                  {errors.discount_value && (
                    <p className="mt-2 text-xs text-error-500">
                      {errors.discount_value.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="mb-5 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Validity Period
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Start */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date & Time <span className="text-error-500">*</span>
                  </label>

                  <input
                    type="datetime-local"
                    {...register("start_date")}
                    className="w-full px-4 py-3 text-sm text-gray-900 transition-all duration-200 bg-white border border-gray-300 outline-none rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />

                  {errors.start_date && (
                    <p className="mt-2 text-xs text-error-500">
                      {errors.start_date.message}
                    </p>
                  )}
                </div>

                {/* End */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date & Time <span className="text-error-500">*</span>
                  </label>

                  <input
                    type="datetime-local"
                    {...register("end_date")}
                    className="w-full px-4 py-3 text-sm text-gray-900 transition-all duration-200 bg-white border border-gray-300 outline-none rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />

                  {errors.end_date && (
                    <p className="mt-2 text-xs text-error-500">
                      {errors.end_date.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Footer Actions */}
            <div className="sticky bottom-0 pt-6 border-t border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-dark/90">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Review all coupon details before publishing.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/coupon-management")}
                    className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
