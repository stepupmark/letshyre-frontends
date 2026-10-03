import React from "react";
import { cn } from "@/lib/utils";

export const FloatingInput = ({
  label,
  name,
  register,
  error,
  required,
  type = "text",
  hint,
  transformValue,
  onBlurModifier,
  wrapperClassName,
  ...inputProps
}) => {
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = error ? `${name}-error` : undefined;

  return (
    <div className={cn("relative flex w-full flex-col", wrapperClassName)}>
      <input
        id={name}
        type={type}
        {...inputProps}
        {...register(name, {
          onChange: (e) => {
            if (transformValue) {
              e.target.value = transformValue(e.target.value);
            }
          },
          onBlur: (e) => {
            if (onBlurModifier) onBlurModifier(e.target.value);
          }
        })}
        placeholder=" "
        className="peer min-h-14 w-full rounded-md border border-border bg-card px-3 py-3.5 text-base text-text-main outline-none transition-[border-color] duration-250 focus:border-brand-600 aria-invalid:border-danger max-md:px-3.5 max-md:leading-normal max-sm:px-3.5 max-sm:text-sm"
        aria-invalid={!!error}
        aria-required={required || undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
      />
      <label htmlFor={name} className="absolute top-3.5 start-3 bg-card px-1.5 text-base text-neutral-400 transition-all duration-250 peer-placeholder-shown:cursor-text peer-focus:-top-2 peer-focus:text-xs peer-focus:text-brand-600 peer-aria-invalid:peer-focus:text-danger peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-neutral-500 peer-aria-invalid:peer-[:not(:placeholder-shown)]:text-danger">
        {label} {required && <span className="ms-0.5 text-danger" aria-hidden="true">*</span>}
      </label>
      {hint && <span id={hintId} className="mt-1 ms-1 text-xs text-neutral-500">{hint}</span>}
      {error && <span id={errorId} className="mt-1 ms-1 text-xs text-danger">{error.message}</span>}
    </div>
  );
};
