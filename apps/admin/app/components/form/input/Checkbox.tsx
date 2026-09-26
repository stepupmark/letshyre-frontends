import clsx from "clsx";

interface CheckboxProps {
  label?: string;
  checked: boolean;
  className?: string;
  id?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  id,
  onChange,
  className = "",
  disabled = false,
}) => {
  return (
    <label
      className={clsx(
        "flex cursor-pointer items-center space-x-3 text-foreground",
        { "cursor-not-allowed opacity-50": disabled },
      )}
    >
      <input
        id={id}
        type="checkbox"
        className={clsx(
          "h-4 w-4 rounded-sm border-input focus:ring-2 focus:ring-ring/50",
          "dark:bg-input/30 dark:checked:border-primary dark:checked:bg-primary",
          "focus:ring-offset-0 focus:outline-hidden",
          className,
        )}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {label && <span className="text-sm font-medium">{label}</span>}
    </label>
  );
};

export default Checkbox;
