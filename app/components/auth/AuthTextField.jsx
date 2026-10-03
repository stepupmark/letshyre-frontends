import { AuthField } from "@/components/auth/AuthField";

/**
 * Labeled text input with an optional trailing (decorative) icon and inline
 * error — the shared auth field used for name / email / mobile.
 *
 * Driven by react-hook-form context: pass `name` and the enclosing <Form>
 * supplies the value, the error and the id/aria wiring. The shared scaffolding
 * and input styling live in AuthField; this only wires up the icon.
 *
 * @param {{
 *   name: string, label: string, type?: string,
 *   icon?: React.ComponentType,
 *   placeholder?: string, autoComplete?: string, inputMode?: string,
 *   autoFocus?: boolean, maxLength?: number,
 *   onChange?: (e: Event) => void   // runs after the field's own onChange
 * }} props
 */
export function AuthTextField({
  name,
  label,
  type = "text",
  icon: Icon,
  placeholder,
  autoComplete,
  inputMode,
  autoFocus,
  maxLength,
  onChange,
}) {
  return (
    <AuthField
      name={name}
      label={label}
      type={type}
      onChange={onChange}
      inputProps={{ placeholder, autoComplete, inputMode, autoFocus, maxLength }}
      trailing={
        Icon && (
          <Icon
            className="pointer-events-none absolute top-1/2 end-4 -translate-y-1/2 text-neutral-400"
            size={20}
            aria-hidden="true"
          />
        )
      }
    />
  );
}
