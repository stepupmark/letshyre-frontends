import { ChevronRight } from "lucide-react";
import { PaymentRecord } from "../../api/payments.api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
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
    <div className="overflow-hidden bg-white border border-gray-200 rounded-xl dark:border-white/10 dark:bg-gray-dark shadow-theme-xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-white/10">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Employer
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Company
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Amount
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Tokens
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Order ID
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-400"
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
                  className="px-5 py-8 text-sm text-center text-gray-500 dark:text-gray-400"
                >
                  Loading payments...
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-5 py-8 text-sm text-center text-gray-500 dark:text-gray-400"
                >
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="transition-colors border-b border-gray-100 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-gray-800"
                >
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {payment.employeer}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <span className="text-gray-700 dark:text-gray-300">
                      {payment.company}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatAmount(payment.amount_paid, payment.currency)}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-800 dark:text-gray-300">
                      {payment.tokens_credited}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.payment_status)}
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                      {payment.payment_order_id}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(payment.created_at)}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right whitespace-nowrap">
                    {/* <div className="flex items-center justify-end gap-3">
                      <button
                        className="flex items-center gap-1 text-sm font-medium transition-colors text-brand-500 hover:text-brand-600"
                        title="View Details"
                      >
                        <Eye size={16} />
                        <span className="hidden sm:inline">View</span>
                      </button>
                    </div>  */}

                    <Link
                      to={`/dashboard/employers/view-profile/${payment.employeer_id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-95"
                    >
                      View Profile
                      <ChevronRight className="w-5 h-5" />
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
