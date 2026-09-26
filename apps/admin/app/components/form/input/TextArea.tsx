import React from "react";

interface TextareaProps {
  placeholder?: string;
  rows?: number;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  hint?: string;
}

const TextArea: React.FC<TextareaProps> = ({
  placeholder = "Enter your message", // Default placeholder
  rows = 3, // Default number of rows
  value = "", // Default value
  onChange, // Callback for changes
  className = "", // Additional custom styles
  disabled = false, // Disabled state
  error = false, // Error state
  hint = "", // Default hint text
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  let textareaClasses = `w-full rounded-lg border px-4 py-2.5 text-sm shadow-xs focus:outline-hidden ${className} `;

  if (disabled) {
    textareaClasses += ` bg-muted opacity-50 text-muted-foreground border-input cursor-not-allowed`;
  } else if (error) {
    textareaClasses += ` bg-transparent border-input focus:border-destructive/50 focus:ring-3 focus:ring-destructive/10 dark:bg-input/30 dark:text-white/90`;
  } else {
    textareaClasses += ` bg-transparent text-foreground border-input focus:border-ring focus:ring-3 focus:ring-ring/50 dark:bg-input/30`;
  }

  return (
    <div className="relative">
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={textareaClasses}
      />
      {hint && (
        <p
          className={`mt-2 text-sm ${
            error ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default TextArea;
