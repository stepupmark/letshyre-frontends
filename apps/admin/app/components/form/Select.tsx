import { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange(value);
  };

  return (
    <select
      className={`h-11 w-full appearance-none rounded-lg border border-input bg-transparent px-4 py-2.5 pr-11 text-sm shadow-xs placeholder:text-muted-foreground focus:border-ring focus:outline-hidden focus:ring-3 focus:ring-ring/50 dark:bg-input/30 ${
        selectedValue
          ? "text-foreground"
          : "text-muted-foreground"
      } ${className}`}
      value={selectedValue}
      onChange={handleChange}
    >
      <option
        value=""
        disabled
        className="text-foreground dark:bg-popover"
      >
        {placeholder}
      </option>
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-foreground dark:bg-popover"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
