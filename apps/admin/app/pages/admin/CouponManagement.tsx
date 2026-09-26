import { useState } from "react";
import { useSearchParams } from "react-router";
import { Plus } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { useCoupons } from "../../hooks/useCoupons";
import CouponTable from "../../components/coupons/CouponTable";
import Button from "../../components/legacy-ui/button/Button";
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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Coupon Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              List of existing coupons. You can create, update, and delete
              coupons here.
            </p>
          </div>
          <Button
            startIcon={<Plus size={18} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create New Coupon
          </Button>
        </div>

        <CouponTable coupons={data?.results || []} isLoading={isLoading} />

        {data && data.total_pages > 1 && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {(data.current_page - 1) * data.page_size + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(data.current_page * data.page_size, data.count)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {data.count}
              </span>{" "}
              coupons
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(data.current_page - 1)}
                disabled={data.current_page === 1}
                className="rounded-lg border border-input bg-card px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(data.current_page + 1)}
                disabled={data.current_page === data.total_pages}
                className="rounded-lg border border-input bg-card px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
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
