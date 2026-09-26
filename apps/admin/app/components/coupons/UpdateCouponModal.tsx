import { useState, useEffect } from "react";
import { Modal } from "../legacy-ui/modal/model2";
import Button from "../legacy-ui/button/Button";
import { useUpdateCoupon } from "../../hooks/useCoupons";
import { Coupon } from "../../api/coupons.api";

interface UpdateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
}

export default function UpdateCouponModal({
  isOpen,
  onClose,
  coupon,
}: UpdateCouponModalProps) {
  const { mutate: updateCoupon, isPending } = useUpdateCoupon();

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "flat" as "flat" | "percentage",
    discount_value: "",
    usage_limit: 0,
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (coupon) {
      // Extract the YYYY-MM-DDTHH:MM part for datetime-local input
      const startStr = coupon.start_date
        ? coupon.start_date.substring(0, 16)
        : "";
      const endStr = coupon.end_date ? coupon.end_date.substring(0, 16) : "";

      setFormData({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        usage_limit: coupon.usage_limit,
        start_date: startStr,
        end_date: endStr,
      });
    }
  }, [coupon]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    let value = e.target.value;
    const name = e.target.name;

    if (name === "code") {
      value = value.toUpperCase();
    }

    if (name === "discount_value" && formData.discount_type === "percentage") {
      if (Number(value) > 99) {
        value = "99";
      }
    }

    if (name === "discount_type" && value === "percentage") {
      if (Number(formData.discount_value) > 99) {
        setFormData({
          ...formData,
          discount_type: value as "flat" | "percentage",
          discount_value: "99",
        });
        return;
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupon) return;

    // Convert back to ISO string for the backend
    const formattedData = {
      ...formData,
      usage_limit: Number(formData.usage_limit),
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
    };

    updateCoupon(
      { id: coupon.id, data: formattedData },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="mx-2 max-w-lg p-4 sm:p-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Update Coupon</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Modify the details of the selected coupon.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Coupon Code
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-input px-4 py-2 focus:border-ring focus:ring-ring/50 dark:bg-input/30 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Discount Type
            </label>
            <select
              name="discount_type"
              value={formData.discount_type}
              onChange={handleChange}
              className="w-full rounded-lg border border-input px-4 py-2 focus:border-ring focus:ring-ring/50 dark:bg-input/30 dark:text-white"
            >
              <option value="flat">Flat</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Discount Value
            </label>
            <input
              type="number"
              name="discount_value"
              value={formData.discount_value}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              max={formData.discount_type === "percentage" ? "99" : undefined}
              className="w-full rounded-lg border border-input px-4 py-2 focus:border-ring focus:ring-ring/50 dark:bg-input/30 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Usage Limit
          </label>
          <input
            type="number"
            name="usage_limit"
            value={formData.usage_limit}
            onChange={handleChange}
            required
            min="1"
            className="w-full rounded-lg border border-input px-4 py-2 focus:border-ring focus:ring-ring/50 dark:bg-input/30 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Start Date
            </label>
            <input
              type="datetime-local"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-input px-4 py-2 focus:border-ring focus:ring-ring/50 dark:bg-input/30 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              End Date
            </label>
            <input
              type="datetime-local"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-input px-4 py-2 focus:border-ring focus:ring-ring/50 dark:bg-input/30 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update Coupon"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
