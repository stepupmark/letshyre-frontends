import React, { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;

  min?: string | number;
  max?: string | number;
  step?: number;

  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  rightIcon?: React.ReactNode;
  required?: boolean;

  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      id,
      name,
      placeholder,
      className = "",
      min,
      max,
      step,
      disabled = false,
      success = false,
      error = false,
      hint,
      required = false,
      onChange,
      onBlur,
      rightIcon,
    },
    ref,
  ) => {
    let inputClasses = `h-11 w-full rounded-lg border px-4 py-2.5 text-sm ${className}`;

    if (disabled) {
      inputClasses += ` opacity-40 cursor-not-allowed`;
    } else if (error) {
      inputClasses += ` border-red-500`;
    } else if (success) {
      inputClasses += ` border-green-500`;
    } else {
      inputClasses += ` border-gray-300`;
    }

    return (
      <div className="relative">
        <div className="relative">
          <input
            ref={ref}
            type={type}
            id={id}
            name={name}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            required={required}
            onChange={onChange}
            onBlur={onBlur}
            className={inputClasses}
          />

          {rightIcon && (
            <span className="absolute -translate-y-1/2 top-1/2 right-3">
              {rightIcon}
            </span>
          )}
        </div>

        {hint && (
          <p
            className={`mt-1.5 text-xs ${
              error
                ? "text-red-500"
                : success
                  ? "text-green-500"
                  : "text-gray-500"
            }`}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
