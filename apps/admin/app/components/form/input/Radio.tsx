interface RadioProps {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  label: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const Radio: React.FC<RadioProps> = ({
  id,
  name,
  value,
  checked,
  label,
  onChange,
  className = "",
  disabled = false,
}) => {
  return (
    <label
      htmlFor={id}
      className={`relative flex cursor-pointer items-center gap-3 text-sm font-medium select-none ${
        disabled
          ? "cursor-not-allowed text-muted-foreground/70"
          : "text-foreground"
      } ${className}`}
    >
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={() => !disabled && onChange(value)}
        className="sr-only"
        disabled={disabled}
      />
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-[1.25px] ${
          checked ? "border-primary bg-primary" : "border-input bg-transparent"
        } ${disabled ? "border-border bg-muted" : ""}`}
      >
        <span
          className={`h-2 w-2 rounded-full bg-card ${
            checked ? "block" : "hidden"
          }`}
        ></span>
      </span>
      {label}
    </label>
  );
};

export default Radio;
