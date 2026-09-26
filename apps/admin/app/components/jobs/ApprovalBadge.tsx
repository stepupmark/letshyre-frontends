import React from "react";
import Badge from "../legacy-ui/badge/Badge";

interface ApprovalBadgeProps {
  status: "pending" | "approved" | "rejected";
}

const ApprovalBadge: React.FC<ApprovalBadgeProps> = ({ status }) => {
  const config = {
    pending: { color: "warning", label: "Pending" },
    approved: { color: "success", label: "Approved" },
    rejected: { color: "error", label: "Rejected" },
  } as const;

  const { color, label } = config[status] || { color: "light", label: status };

  return (
    <Badge variant="light" color={color}>
      {label}
    </Badge>
  );
};

export default ApprovalBadge;
