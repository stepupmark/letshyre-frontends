import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  couponFormSchema,
  type CouponFormValues,
  type CouponPayload,
} from "../schemas/coupons.schema";
import { EMPTY_COUPON, toCouponPayload } from "../utils/coupon-values";

type CouponFormProps = {
  id: string;
  defaultValues?: CouponFormValues;
  onSubmit: (payload: CouponPayload) => void;
  /** Rendered after the fields, usually the submit buttons. */
  footer: ReactNode;
};

export function CouponForm({
  id,
  defaultValues = EMPTY_COUPON,
  onSubmit,
  footer,
}: CouponFormProps) {
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues,
  });
  const discountType = form.watch("discount_type");
  const { errors } = form.formState;

  return (
    <form
      id={id}
      noValidate
      onSubmit={form.handleSubmit((values) =>
        onSubmit(toCouponPayload(values)),
      )}
    >
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.code)}>
          <FieldLabel htmlFor={`${id}-code`}>Code</FieldLabel>
          <Input
            id={`${id}-code`}
            placeholder="WELCOME50"
            className="font-mono uppercase"
            autoComplete="off"
            aria-invalid={Boolean(errors.code)}
            {...form.register("code")}
          />
          {errors.code ? (
            <FieldError errors={[errors.code]} />
          ) : (
            <FieldDescription>Letters, numbers, - and _.</FieldDescription>
          )}
        </Field>

        <Field data-invalid={Boolean(errors.usage_limit)}>
          <FieldLabel htmlFor={`${id}-usage`}>Usage limit</FieldLabel>
          <Input
            id={`${id}-usage`}
            type="number"
            min={1}
            inputMode="numeric"
            aria-invalid={Boolean(errors.usage_limit)}
            {...form.register("usage_limit")}
          />
          <FieldError errors={[errors.usage_limit]} />
        </Field>

        <Field>
          <FieldLabel htmlFor={`${id}-type`}>Discount type</FieldLabel>
          <Controller
            control={form.control}
            name="discount_type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={`${id}-type`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat amount (₹)</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field data-invalid={Boolean(errors.discount_value)}>
          <FieldLabel htmlFor={`${id}-value`}>
            Discount {discountType === "flat" ? "(₹)" : "(%)"}
          </FieldLabel>
          <Input
            id={`${id}-value`}
            type="number"
            step="0.01"
            min={0}
            inputMode="decimal"
            aria-invalid={Boolean(errors.discount_value)}
            {...form.register("discount_value")}
          />
          <FieldError errors={[errors.discount_value]} />
        </Field>

        <Field data-invalid={Boolean(errors.start_date)}>
          <FieldLabel htmlFor={`${id}-start`}>Starts</FieldLabel>
          <Input
            id={`${id}-start`}
            type="datetime-local"
            aria-invalid={Boolean(errors.start_date)}
            {...form.register("start_date")}
          />
          <FieldError errors={[errors.start_date]} />
        </Field>

        <Field data-invalid={Boolean(errors.end_date)}>
          <FieldLabel htmlFor={`${id}-end`}>Ends</FieldLabel>
          <Input
            id={`${id}-end`}
            type="datetime-local"
            aria-invalid={Boolean(errors.end_date)}
            {...form.register("end_date")}
          />
          <FieldError errors={[errors.end_date]} />
        </Field>
      </FieldGroup>
      {footer}
    </form>
  );
}
