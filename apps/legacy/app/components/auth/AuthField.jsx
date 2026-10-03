import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/**
 * The shared shell behind AuthTextField and AuthPasswordField.
 *
 * Both fields render the same react-hook-form scaffolding — a labelled
 * FormItem, a relative wrapper holding the <Input> and one trailing element,
 * an optional footer line, and the inline error — with the same (long) input
 * class string. That structure lived in both files; it now lives here once.
 * Each field supplies only what differs:
 *
 *   - `type`       — password toggles this between "password" and "text"
 *   - `trailing`   — decorative icon (text) or show/hide button (password)
 *   - `footer`     — the Caps-Lock hint (password only)
 *   - `inputProps` — placeholder, autoComplete, key handlers, maxLength, …
 *   - `onChange`   — runs after the field's own onChange (text only)
 *
 * `inputProps` is spread last so a field can add attributes, but it must not
 * carry `onChange`: the composed handler above owns that so react-hook-form's
 * own onChange always runs first.
 */
export function AuthField({
  name,
  label,
  type = "text",
  trailing,
  footer,
  inputProps,
  onChange,
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="text-start">
          <FormLabel className="text-sm font-bold text-text-main">{label}</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                {...field}
                type={type}
                className="h-auto w-full rounded-md border-[1.5px] border-border bg-card py-3.5 pe-11 ps-4 text-base md:text-base text-text-main shadow-none transition-[border-color,box-shadow] outline-none placeholder:text-neutral-400 focus-visible:border-border-focus focus-visible:ring-[3px] focus-visible:ring-brand-600/12 aria-invalid:border-danger"
                onChange={(e) => {
                  field.onChange(e);
                  onChange?.(e);
                }}
                {...inputProps}
              />
            </FormControl>
            {trailing}
          </div>
          {footer}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
