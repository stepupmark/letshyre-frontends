type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium";

  const sizeStyles = {
    sm: "text-xs", // Smaller padding and font size
    md: "text-sm", // Default padding and font size
  };

  const variants = {
    light: {
      primary:
        "bg-primary/10 text-primary",
      success:
        "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500",
      error:
        "bg-destructive/10 text-destructive",
      warning:
        "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-orange-400",
      info: "bg-sky-50 text-sky-500 dark:bg-sky-500/15 dark:text-sky-500",
      light: "bg-muted text-foreground",
      dark: "bg-muted-foreground text-white dark:text-white",
    },
    solid: {
      primary: "bg-primary text-primary-foreground",
      success: "bg-green-500 text-white dark:text-white",
      error: "bg-destructive text-white dark:text-white",
      warning: "bg-amber-500 text-white dark:text-white",
      info: "bg-sky-500 text-white dark:text-white",
      light: "bg-muted-foreground text-white dark:text-white/80",
      dark: "bg-primary text-primary-foreground",
    },
  };

  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

export default Badge;
