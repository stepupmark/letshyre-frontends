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
        "flex items-center space-x-3 cursor-pointer text-foreground",
        { "cursor-not-allowed opacity-50": disabled }
      )}
    >
      <input
        id={id}
        type="checkbox"
        className={clsx(
          "w-4 h-4 border-input rounded-sm focus:ring-2 focus:ring-ring/50",
          "dark:bg-input/30 dark:checked:bg-primary dark:checked:border-primary",
          "focus:ring-offset-0 focus:outline-hidden",
          className
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
