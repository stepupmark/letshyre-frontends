import { useState } from "react";
import { useSearchParams } from "react-router";
import { Plus } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { useCoupons } from "../../hooks/useCoupons";
import CouponTable from "../../components/coupons/CouponTable";
import Button from "../../components/ui/button/Button";
import CreateCouponModal from "../../components/coupons/CreateCouponModal";

export default function CouponManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const page = parseInt(searchParams.get("page") || "1", 10);

  const { data, isLoading } = useCoupons(page);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  return (
    <>
      <PageMeta
        title="LetsHyre Admin – Coupon Management"
        description="List of existing coupons and management operations."
      />

      <div className="w-full max-w-full">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Coupon Management
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              List of existing coupons. You can create, update, and delete coupons here.
            </p>
          </div>
          <Button startIcon={<Plus size={18} />} onClick={() => setIsCreateModalOpen(true)}>
            Create New Coupon
          </Button>
        </div>

        <CouponTable coupons={data?.results || []} isLoading={isLoading} />

        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between p-4 mt-6 bg-white border border-gray-200 dark:bg-gray-dark dark:border-white/10 rounded-xl shadow-theme-xs">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {(data.current_page - 1) * data.page_size + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.min(data.current_page * data.page_size, data.count)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.count}
              </span>{" "}
              coupons
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(data.current_page - 1)}
                disabled={data.current_page === 1}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(data.current_page + 1)}
                disabled={data.current_page === data.total_pages}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateCouponModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
