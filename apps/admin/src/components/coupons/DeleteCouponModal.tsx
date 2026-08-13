import { AlertTriangle } from "lucide-react";
import { Modal } from "../ui/modal/model2";
import Button from "../ui/button/Button";
import { Coupon } from "../../api/coupons.api";
import { useDeleteCoupon } from "../../hooks/useCoupons";

interface DeleteCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
}

export default function DeleteCouponModal({
  isOpen,
  onClose,
  coupon,
}: DeleteCouponModalProps) {
  const { mutate: deleteCoupon, isPending: isDeleting } = useDeleteCoupon();

  if (!coupon) return null;

  const handleDelete = () => {
    deleteCoupon(coupon.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[400px] p-0 overflow-hidden rounded-2xl shadow-2xl">
      <div className="relative px-6 pt-8 pb-6 text-center sm:px-8 sm:pt-10 sm:pb-8">
        {/* Subtle background gradient for premium feel */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-error-50 via-white to-white dark:from-error-900/20 dark:via-gray-dark dark:to-gray-dark opacity-90"></div>
        
        <div className="relative flex flex-col items-center">
          {/* Animated icon container */}
          <div className="relative flex items-center justify-center w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full bg-error-100 dark:bg-error-900/30 animate-ping opacity-50 duration-1000"></div>
            <div className="relative flex items-center justify-center w-16 h-16 bg-error-100 rounded-full dark:bg-error-900/50 ring-8 ring-error-50 dark:ring-error-900/20 shadow-sm">
              <AlertTriangle className="w-8 h-8 text-error-600 dark:text-error-500" strokeWidth={1.75} />
            </div>
          </div>

          <h3 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Delete Coupon?
          </h3>
          
          <div className="mb-8 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            <p>You are about to permanently delete this coupon:</p>
            <div className="inline-block px-4 py-2 mt-3 mb-3 font-mono text-base font-bold tracking-widest text-error-700 bg-error-50 border border-error-200 border-dashed rounded-lg dark:bg-error-900/20 dark:border-error-800 dark:text-error-400 shadow-sm">
              {coupon.code}
            </div>
            <p className="text-xs font-medium text-error-600 dark:text-error-500">This action cannot be undone.</p>
          </div>
        </div>
        
        <div className="flex w-full gap-3 mt-2">
          <Button 
            variant="outline" 
            className="w-1/2 py-2.5 font-medium border-gray-200 hover:bg-gray-50 text-gray-700 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            className="w-1/2 py-2.5 font-medium bg-error-600 hover:bg-error-700 text-white border-transparent shadow-md shadow-error-500/20 transition-all active:scale-[0.98]" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
