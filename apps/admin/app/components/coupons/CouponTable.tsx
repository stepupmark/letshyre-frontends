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
} from "../legacy-ui/table";
import Badge from "../legacy-ui/badge/Badge";
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
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-border bg-muted/50">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
                >
                  Code
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
                >
                  Discount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
                >
                  Usage
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
                >
                  Validity
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
                    colSpan={5}
                    className="px-5 py-8 text-center text-sm text-muted-foreground"
                  >
                    Loading coupons...
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-5 py-8 text-center text-sm text-muted-foreground"
                  >
                    No coupons found.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow
                    key={coupon.id}
                    className="border-b border-border transition-colors hover:bg-accent"
                  >
                    <TableCell className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                          title="Copy Code"
                        >
                          {copiedCode === coupon.code ? (
                            <Check size={14} className="text-green-500" />
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
                        <span className="text-sm text-foreground">
                          {coupon.used_count} / {coupon.usage_limit}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Times Used
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                          <Calendar
                            size={12}
                            className="text-muted-foreground"
                          />
                          {formatDate(coupon.start_date)}
                        </div>
                        <ArrowRight
                          size={14}
                          className="text-muted-foreground"
                        />
                        <div className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                          <Calendar
                            size={12}
                            className="text-muted-foreground"
                          />
                          {formatDate(coupon.end_date)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setSelectedCoupon(coupon)}
                          className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary"
                          title="Edit"
                        >
                          <Pencil size={16} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="flex items-center gap-1 text-sm font-medium text-destructive transition-colors hover:text-destructive"
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
