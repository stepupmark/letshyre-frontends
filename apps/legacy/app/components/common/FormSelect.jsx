import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Thin wrapper over shadcn <Select>. Options are `{ value, label }`; the trigger
 * defaults to full width since every caller is a form/filter field.
 *
 * Radix forbids `value=""`, so an unselected field uses a `""`/undefined value
 * that matches no item and shows the placeholder. For react-hook-form, drive it
 * from a <Controller> (value={field.value}, onValueChange={field.onChange}).
 *
 * Radix emits "" when the value lands before its items do; no item can be "",
 * so that's never a real choice and is dropped rather than wiping the field.
 */
export function FormSelect({
  value,
  onValueChange,
  options = [],
  placeholder,
  className,
  // Forwarded to SelectContent — e.g. a z-index bump when the select lives
  // inside a bespoke high-z modal so its portaled list isn't occluded.
  contentClassName,
  triggerId,
  disabled,
  // `size="auto"` leaves height to `className` (for matching a taller sibling <Input>).
  size = "default",
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  ...props
}) {
  return (
    <Select
      value={value ?? ""}
      onValueChange={(v) => v !== "" && onValueChange?.(v)}
      disabled={disabled}
      {...props}
    >
      <SelectTrigger
        id={triggerId}
        size={size}
        aria-invalid={ariaInvalid}
        aria-label={ariaLabel}
        className={cn("w-full", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper" className={cn("max-h-60", contentClassName)}>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default FormSelect;
