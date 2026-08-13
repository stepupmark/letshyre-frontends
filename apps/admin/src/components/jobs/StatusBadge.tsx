import React from "react";
import Badge from "../ui/badge/Badge";

interface StatusBadgeProps {
  status: "open" | "paused" | "closed";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    open: { color: "success", label: "Open" },
    paused: { color: "warning", label: "Paused" },
    closed: { color: "error", label: "Closed" },
  } as const;

  const { color, label } = config[status] || { color: "light", label: status };

  return (
    <Badge variant="light" color={color as any}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
