import { ChevronRight } from "lucide-react";
import { PaymentRecord } from "../../api/payments.api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../legacy-ui/table";
import Badge from "../legacy-ui/badge/Badge";
import { Link } from "react-router";
import { formatDate } from "../../lib/formatDate";

interface PaymentsTableProps {
  payments: PaymentRecord[];
  isLoading: boolean;
}

export default function PaymentsTable({
  payments,
  isLoading,
}: PaymentsTableProps) {
  const formatAmount = (amount: string, currency: string = "INR") => {
    try {
      const numAmount = parseFloat(amount);
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(numAmount);
    } catch {
      return `₹${amount}`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <Badge color="success">Success</Badge>;
      case "pending":
      case "created":
        return <Badge color="warning">Pending</Badge>;
      case "failed":
        return <Badge color="error">Failed</Badge>;
      default:
        return <Badge color="info">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-border bg-muted/50">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                Employer
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                Company
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                Amount
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                Tokens
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                Order ID
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-5 py-8 text-center text-sm text-muted-foreground"
                >
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-5 py-8 text-center text-sm text-muted-foreground"
                >
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="border-b border-border transition-colors hover:bg-accent"
                >
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <span className="font-medium text-foreground">
                      {payment.employeer}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <span className="text-foreground">{payment.company}</span>
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <span className="font-semibold text-foreground">
                      {formatAmount(payment.amount_paid, payment.currency)}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                      {payment.tokens_credited}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.payment_status)}
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs text-muted-foreground">
                      {payment.payment_order_id}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(payment.created_at)}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right whitespace-nowrap">
                    <Link
                      to={`/dashboard/employers/${payment.employeer_id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90 active:scale-95"
                    >
                      View Profile
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
