import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PaymentsCards from "../../components/payments/PaymentsCards";
import PaymentsTable from "../../components/payments/PaymentsTable";
import { usePaymentHistory } from "../../hooks/usePayments";
import Button from "../../components/legacy-ui/button/Button";

export default function PaymentHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    payment_status: searchParams.get("payment_status") || "ALL",
    min_amount: searchParams.get("min_amount") || "",
    max_amount: searchParams.get("max_amount") || "",
    start_date: searchParams.get("start_date") || "",
    end_date: searchParams.get("end_date") || "",
    company: searchParams.get("company") || "",
    search: searchParams.get("search") || "",
  });

  useEffect(() => {
    setLocalFilters({
      payment_status: searchParams.get("payment_status") || "ALL",
      min_amount: searchParams.get("min_amount") || "",
      max_amount: searchParams.get("max_amount") || "",
      start_date: searchParams.get("start_date") || "",
      end_date: searchParams.get("end_date") || "",
      company: searchParams.get("company") || "",
      search: searchParams.get("search") || "",
    });
  }, [searchParams]);

  const { data, isLoading } = usePaymentHistory({
    page,
    payment_status: searchParams.get("payment_status") || undefined,
    min_amount: searchParams.get("min_amount") || undefined,
    max_amount: searchParams.get("max_amount") || undefined,
    start_date: searchParams.get("start_date") || undefined,
    end_date: searchParams.get("end_date") || undefined,
    company: searchParams.get("company") || undefined,
    search: searchParams.get("search") || undefined,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setLocalFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();

    params.set("page", "1");
    if (localFilters.payment_status && localFilters.payment_status !== "ALL")
      params.set("payment_status", localFilters.payment_status);
    if (localFilters.min_amount)
      params.set("min_amount", localFilters.min_amount);
    if (localFilters.max_amount)
      params.set("max_amount", localFilters.max_amount);
    if (localFilters.start_date)
      params.set("start_date", localFilters.start_date);
    if (localFilters.end_date) params.set("end_date", localFilters.end_date);
    if (localFilters.company) params.set("company", localFilters.company);
    if (localFilters.search) params.set("search", localFilters.search);

    setSearchParams(params);
  };

  const clearFilters = () => {
    setLocalFilters({
      payment_status: "ALL",
      min_amount: "",
      max_amount: "",
      start_date: "",
      end_date: "",
      company: "",
      search: "",
    });
    setSearchParams(new URLSearchParams({ page: "1" }));
  };

  const activeFilterCount = Array.from(searchParams.keys()).filter(
    (k) => k !== "page" && k !== "search",
  ).length;

  return (
    <>
      <PageMeta
        title="LetsHyre Admin – Payments History"
        description="Monitor and manage all employer payment transactions."
      />

      <div className="w-full max-w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Payments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A comprehensive financial control panel for tracking all
            transactions.
          </p>
        </div>

        <PaymentsCards />

        <div className="overflow-hidden bg-card border border-border rounded-xl shadow-xs">
          <div className="flex flex-col gap-4 p-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={applyFilters} className="relative flex-1 max-w-lg">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  name="search"
                  className="block w-full p-2.5 pl-10 pr-20 text-sm text-foreground border border-input rounded-lg bg-muted/50 focus:ring-ring/50 focus:border-ring dark:placeholder:text-muted-foreground"
                  placeholder="Search by Order ID or Keyword..."
                  value={localFilters.search}
                  onChange={handleFilterChange}
                />
                <button
                  type="submit"
                  className="absolute inset-y-1 right-1 px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-ring/50 dark:focus:ring-offset-background transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <X size={16} /> Clear All
                </button>
              )}
              <Button
                variant={
                  showFilters || activeFilterCount > 0 ? "primary" : "outline"
                }
                startIcon={<SlidersHorizontal size={18} />}
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </div>
          </div>

          {showFilters && (
            <form
              onSubmit={applyFilters}
              className="p-5 bg-muted/50"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </label>
                  <select
                    name="payment_status"
                    className="w-full p-2.5 text-sm border-input rounded-lg dark:bg-muted dark:text-white focus:ring-ring/50 focus:border-ring"
                    value={localFilters.payment_status}
                    onChange={handleFilterChange}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Success">Success</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-muted-foreground uppercase">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. Amazon"
                    className="w-full p-2.5 text-sm border-input rounded-lg dark:bg-muted dark:text-white focus:ring-ring/50 focus:border-ring"
                    value={localFilters.company}
                    onChange={handleFilterChange}
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-muted-foreground uppercase">
                    Amount Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="min_amount"
                      placeholder="Min"
                      className="w-full p-2.5 text-sm border-input rounded-lg dark:bg-muted dark:text-white focus:ring-ring/50 focus:border-ring"
                      value={localFilters.min_amount}
                      onChange={handleFilterChange}
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      type="number"
                      name="max_amount"
                      placeholder="Max"
                      className="w-full p-2.5 text-sm border-input rounded-lg dark:bg-muted dark:text-white focus:ring-ring/50 focus:border-ring"
                      value={localFilters.max_amount}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>

                <div className="lg:col-span-2 xl:col-span-2">
                  <label className="block mb-1.5 text-xs font-semibold text-muted-foreground uppercase">
                    Date Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      name="start_date"
                      className="w-full p-2.5 text-sm border-input rounded-lg dark:bg-muted dark:text-white focus:ring-ring/50 focus:border-ring"
                      value={localFilters.start_date}
                      onChange={handleFilterChange}
                    />
                    <span className="text-muted-foreground">to</span>
                    <input
                      type="date"
                      name="end_date"
                      className="w-full p-2.5 text-sm border-input rounded-lg dark:bg-muted dark:text-white focus:ring-ring/50 focus:border-ring"
                      value={localFilters.end_date}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-5">
                <Button type="submit">Apply Filters</Button>
              </div>
            </form>
          )}
        </div>

        <PaymentsTable payments={data?.results || []} isLoading={isLoading} />

        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-xs">
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
              payments
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(data.current_page - 1)}
                disabled={data.current_page === 1}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-input bg-card text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(data.current_page + 1)}
                disabled={data.current_page === data.total_pages}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-input bg-card text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
