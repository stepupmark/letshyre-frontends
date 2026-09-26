import { useState } from "react";

interface SwitchProps {
  label: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  color?: "blue" | "gray";
}

const Switch: React.FC<SwitchProps> = ({
  label,
  defaultChecked = false,
  disabled = false,
  onChange,
  color = "blue", // Default to blue color
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const handleToggle = () => {
    if (disabled) return;
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    if (onChange) {
      onChange(newCheckedState);
    }
  };

  const switchColors =
    color === "blue"
      ? {
          background: isChecked ? "bg-primary " : "bg-muted", // Blue version
          knob: isChecked
            ? "translate-x-full bg-card"
            : "translate-x-0 bg-card",
        }
      : {
          background: isChecked ? "bg-primary" : "bg-muted", // Gray version
          knob: isChecked
            ? "translate-x-full bg-card"
            : "translate-x-0 bg-card",
        };

  return (
    <label
      className={`flex cursor-pointer items-center gap-3 text-sm font-medium select-none ${
        disabled ? "text-muted-foreground" : "text-foreground"
      }`}
      onClick={handleToggle}
    >
      <div className="relative">
        <div
          className={`block h-6 w-11 rounded-full transition duration-150 ease-linear ${
            disabled ? "pointer-events-none bg-muted" : switchColors.background
          }`}
        ></div>
        <div
          className={`absolute top-0.5 left-0.5 h-5 w-5 transform rounded-full shadow-sm duration-150 ease-linear ${switchColors.knob}`}
        ></div>
      </div>
      {label}
    </label>
  );
};

export default Switch;
