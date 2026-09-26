import React from "react";
import Badge, { type BadgeColor } from "../legacy-ui/badge/Badge";

interface StatusBadgeProps {
  status: "open" | "paused" | "closed";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    open: { color: "success", label: "Open" },
    paused: { color: "warning", label: "Paused" },
    closed: { color: "error", label: "Closed" },
  } as const;

  const { color, label }: { color: BadgeColor; label: string } = config[status] ?? { color: "light", label: status };

  return (
    <Badge variant="light" color={color}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
