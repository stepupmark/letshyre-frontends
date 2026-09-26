import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../legacy-ui/modal/model2";
import Button from "../legacy-ui/button/Button";
import { useCreateCoupon } from "../../hooks/useCoupons";
import { CouponFormValues, couponSchema } from "../../schemas/coupon.schema";

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCouponModal({
  isOpen,
  onClose,
}: CreateCouponModalProps) {
  const { mutate: createCoupon, isPending } = useCreateCoupon();

  const {
    register,
    handleSubmit,
    watch,
    reset,
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
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg p-4 mx-2 sm:p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">
          Create New Coupon
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Provide the necessary information to generate a new discount coupon.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block mb-1 text-sm font-medium text-foreground">
            Coupon Code <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            {...register("code")}
            placeholder="e.g. WELCOME50"
            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-ring/50 focus:border-ring dark:bg-input/30 dark:text-white"
          />
          {errors.code && (
            <p className="mt-1 text-xs text-destructive">
              {errors.code.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-foreground">
              Discount Type <span className="text-destructive">*</span>
            </label>
            <select
              {...register("discount_type")}
              className="w-full px-4 py-2 border border-input rounded-lg focus:ring-ring/50 focus:border-ring dark:bg-input/30 dark:text-white"
            >
              <option value="flat">Flat Amount</option>
              <option value="percentage">Percentage (%)</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-foreground">
              Discount Value <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              {...register("discount_value")}
              step="0.01"
              min="0"
              placeholder={
                discountType === "flat" ? "e.g. 500" : "e.g. 15"
              }
              className="w-full px-4 py-2 border border-input rounded-lg focus:ring-ring/50 focus:border-ring dark:bg-input/30 dark:text-white"
            />
            {errors.discount_value && (
              <p className="mt-1 text-xs text-destructive">
                {errors.discount_value.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-foreground">
            Usage Limit <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            {...register("usage_limit")}
            min="1"
            placeholder="Max uses"
            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-ring/50 focus:border-ring dark:bg-input/30 dark:text-white"
          />
          {errors.usage_limit && (
            <p className="mt-1 text-xs text-destructive">
              {errors.usage_limit.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-foreground">
              Start Date & Time <span className="text-destructive">*</span>
            </label>
            <input
              type="datetime-local"
              {...register("start_date")}
              className="w-full px-4 py-2 border border-input rounded-lg focus:ring-ring/50 focus:border-ring dark:bg-input/30 dark:text-white"
            />
            {errors.start_date && (
              <p className="mt-1 text-xs text-destructive">
                {errors.start_date.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-foreground">
              End Date & Time <span className="text-destructive">*</span>
            </label>
            <input
              type="datetime-local"
              {...register("end_date")}
              className="w-full px-4 py-2 border border-input rounded-lg focus:ring-ring/50 focus:border-ring dark:bg-input/30 dark:text-white"
            />
            {errors.end_date && (
              <p className="mt-1 text-xs text-destructive">
                {errors.end_date.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Coupon"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
