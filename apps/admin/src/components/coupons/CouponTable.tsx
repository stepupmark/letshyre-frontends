import { useState } from "react";
import {
  Pencil,
  Trash2,
  Calendar,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Coupon } from "../../api/coupons.api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import UpdateCouponModal from "./UpdateCouponModal";
import DeleteCouponModal from "./DeleteCouponModal";
import { formatDate } from "../../lib/formatDate";

interface CouponTableProps {
  coupons: Coupon[];
  isLoading: boolean;
}

export default function CouponTable({ coupons, isLoading }: CouponTableProps) {
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleDelete = (coupon: Coupon) => {
    setCouponToDelete(coupon);
  };

  const copyToClipboard = async (code: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success("Coupon code copied!");
        setTimeout(() => setCopiedCode(null), 2000);
      } else {
        // Fallback for environments without clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopiedCode(code);
        toast.success("Coupon code copied!");
        setTimeout(() => setCopiedCode(null), 2000);
      }
    } catch (err) {
      toast.error("Failed to copy code");
      if (import.meta.env.DEV) {
        console.error("Copy failed:", err);
      }
    }
  };

  return (
    <>
      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl dark:border-white/10 dark:bg-gray-dark shadow-theme-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-white/10">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
                >
                  Code
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
                >
                  Discount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
                >
                  Usage
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
                >
                  Validity
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
                    colSpan={5}
                    className="px-5 py-8 text-sm text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading coupons...
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-5 py-8 text-sm text-center text-gray-500 dark:text-gray-400"
                  >
                    No coupons found.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow
                    key={coupon.id}
                    className="transition-colors border-b border-gray-100 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-gray-800"
                  >
                    <TableCell className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="p-1 text-gray-400 transition-colors rounded-md hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Copy Code"
                        >
                          {copiedCode === coupon.code ? (
                            <Check size={14} className="text-success-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 whitespace-nowrap">
                      <Badge
                        color={
                          coupon.discount_type === "percentage"
                            ? "success"
                            : "info"
                        }
                      >
                        {coupon.discount_type === "percentage" ? "" : "₹"}
                        {coupon.discount_value}
                        {coupon.discount_type === "percentage" ? "%" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {coupon.used_count} / {coupon.usage_limit}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Times Used
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-300">
                          <Calendar
                            size={12}
                            className="text-gray-500 dark:text-gray-400"
                          />
                          {formatDate(coupon.start_date)}
                        </div>
                        <ArrowRight size={14} className="text-gray-400" />
                        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-800 dark:text-gray-300">
                          <Calendar
                            size={12}
                            className="text-gray-500 dark:text-gray-400"
                          />
                          {formatDate(coupon.end_date)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setSelectedCoupon(coupon)}
                          className="flex items-center gap-1 text-sm font-medium transition-colors text-brand-500 hover:text-brand-600"
                          title="Edit"
                        >
                          <Pencil size={16} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="flex items-center gap-1 text-sm font-medium transition-colors text-error-500 hover:text-error-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <UpdateCouponModal
        isOpen={!!selectedCoupon}
        onClose={() => setSelectedCoupon(null)}
        coupon={selectedCoupon}
      />

      <DeleteCouponModal
        isOpen={!!couponToDelete}
        onClose={() => setCouponToDelete(null)}
        coupon={couponToDelete}
      />
    </>
  );
}
