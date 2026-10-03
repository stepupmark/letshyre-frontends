import { cloneElement, isValidElement } from "react";
import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

export function Field({
  label,
  id,
  children,
  required = false,
  error = null,
  helperText = null,
}) {
  const helperId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : helperText ? helperId : undefined;

  // Tie the hint or error to the control so screen readers read it out.
  const control =
    isValidElement(children) && describedBy && !children.props["aria-describedby"]
      ? cloneElement(children, {
          "aria-describedby": describedBy,
          ...(error && { "aria-invalid": true }),
        })
      : children;

  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="flex items-center gap-1 text-sm font-medium text-text-main"
      >
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {control}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-text-muted">{helperText}</p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1 text-xs font-medium text-destructive"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
