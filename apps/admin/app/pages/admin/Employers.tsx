import { useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { useEmployers, useEmployerCards } from "../../hooks/useEmployers";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/legacy-ui/table";
import Badge from "../../components/legacy-ui/badge/Badge";
import {
  ChevronRight,
  Building2,
  CalendarPlus,
  FileCheck,
  AlertCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { formatDate } from "../../lib/formatDate";

function getKycBadgeColor(
  status?: string,
): "success" | "warning" | "error" | "light" {
  switch (status) {
    case "Verified":
      return "success";
    case "Pending":
      return "warning";
    case "Rejected":
      return "error";
    default:
      return "light";
  }
}

function initials(name: string | null | undefined) {
  if (!name) return "UN";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-blue-600",
];

function avatarGradient(name: string | null | undefined) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function Employers() {
  const [page, setPage] = useState(1);
  const { data: qData, isLoading, isError } = useEmployers(page);
  const { data: cardsData, isLoading: cardsLoading } = useEmployerCards();
  const cards = cardsData?.data;

  const paginated = qData?.results || [];
  const totalPages = qData?.total_pages || 1;
  const safePage = Math.min(page, totalPages);

  return (
    <>
      <PageMeta
        title="LetsHyre Admin – Employers"
        description="Browse and manage all employers"
      />

      <div className="space-y-5 overflow-x-hidden bg-muted/50">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employers</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Browse and manage registered employers and their companies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            {
              label: "Total Employers",
              value: cards?.total_employees || 0,
              icon: (
                <Building2 className="size-5 text-indigo-600 dark:text-indigo-400" />
              ),
              bg: "bg-indigo-50 dark:bg-indigo-900/20",
              border: "border-indigo-100 dark:border-indigo-800",
              accent: "from-indigo-500 to-indigo-600",
            },
            {
              label: "Today Joined",
              value: cards?.today_registerations || 0,
              icon: (
                <CalendarPlus className="size-5 text-emerald-600 dark:text-emerald-400" />
              ),
              bg: "bg-emerald-50 dark:bg-emerald-900/20",
              border: "border-emerald-100 dark:border-emerald-800",
              accent: "from-emerald-500 to-emerald-600",
            },
            {
              label: "Completed KYC",
              value: cards?.completed_kycs || 0,
              icon: (
                <FileCheck className="size-5 text-blue-600 dark:text-blue-400" />
              ),
              bg: "bg-blue-50 dark:bg-blue-900/20",
              border: "border-blue-100 dark:border-blue-800",
              accent: "from-blue-500 to-blue-600",
            },
            {
              label: "Incomplete KYC",
              value: cards?.in_completed_kycs || 0,
              icon: (
                <AlertCircle className="size-5 text-amber-600 dark:text-amber-400" />
              ),
              bg: "bg-amber-50 dark:bg-amber-900/20",
              border: "border-amber-100 dark:border-amber-800",
              accent: "from-amber-500 to-amber-600",
            },
            {
              label: "Pending KYC",
              value: cards?.pending_kycs || 0,
              icon: (
                <Clock className="size-5 text-orange-600 dark:text-orange-400" />
              ),
              bg: "bg-orange-50 dark:bg-orange-900/20",
              border: "border-orange-100 dark:border-orange-800",
              accent: "from-orange-500 to-orange-600",
            },
            {
              label: "Verified KYC",
              value: cards?.verified_kycs || 0,
              icon: (
                <ShieldCheck className="size-5 text-purple-600 dark:text-purple-400" />
              ),
              bg: "bg-purple-50 dark:bg-purple-900/20",
              border: "border-purple-100 dark:border-purple-800",
              accent: "from-purple-500 to-purple-600",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${card.accent} opacity-70 transition-opacity duration-300 group-hover:opacity-100`}
              />

              <div className="mt-1 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                    {cardsLoading ? "--" : card.value}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${card.bg} ${card.border} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-border">
                <TableRow>
                  {[
                    "Company",
                    "User",
                    "Contact",
                    "Industry",
                    "Jobs",
                    "Enrollment Date",
                    "KYC",
                    "",
                  ].map((col) => (
                    <TableCell
                      key={col}
                      isHeader
                      className="px-5 py-4 text-left text-xs font-semibold tracking-widest text-muted-foreground uppercase"
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow
                      key={i}
                      className="animate-pulse border-b border-border"
                    >
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-muted"></div>
                          <div className="h-4 w-24 rounded-sm bg-muted"></div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="h-4 w-20 rounded-sm bg-muted"></div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="h-3 w-32 rounded-sm bg-muted"></div>
                          <div className="h-3 w-24 rounded-sm bg-muted"></div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="h-4 w-24 rounded-sm bg-muted"></div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="h-4 w-8 rounded-sm bg-muted"></div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="h-5 w-16 rounded-full bg-muted"></div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="h-8 w-20 rounded-xl bg-muted"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">⚠️</span>
                        <p className="text-sm font-medium text-muted-foreground">
                          Failed to load employers.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">🏢</span>
                        <p className="text-sm font-medium text-muted-foreground">
                          No employers found.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((emp, idx) => {
                    const cName =
                      emp.employer_kyc?.company_name || "Unknown Company";
                    const grad = avatarGradient(cName);

                    const date = emp.employer_kyc?.created_at;

                    return (
                      <TableRow
                        key={emp.id}
                        className={`group transition-colors hover:bg-accent ${
                          idx !== paginated.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                      >
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {emp.employer_kyc?.company_logo ? (
                              <img
                                src={emp.employer_kyc.company_logo}
                                alt={cName}
                                className="h-9 w-9 rounded-xl border border-border object-cover"
                              />
                            ) : (
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${grad} text-xs font-bold text-white shadow-xs`}
                              >
                                {initials(cName)}
                              </div>
                            )}
                            <span className="text-sm font-semibold text-foreground">
                              {cName}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-sm whitespace-nowrap text-foreground">
                          {emp.user_name}
                        </TableCell>

                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm text-muted-foreground">
                              {emp.email}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {emp.phone_number || "—"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-sm whitespace-nowrap text-muted-foreground">
                          {emp.employer_kyc?.company_industry || "—"}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-sm whitespace-nowrap text-muted-foreground">
                          {emp.job_posts}
                        </TableCell>

                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(date as string)}
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          <Badge
                            variant="light"
                            color={getKycBadgeColor(
                              emp.employer_kyc?.kyc_status,
                            )}
                            size="sm"
                          >
                            {emp.employer_kyc?.kyc_status || "Pending"}
                          </Badge>
                        </TableCell>

                        <TableCell className="px-5 py-4 whitespace-nowrap">
                          <Link
                            to={`/dashboard/employers/${emp.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90 active:scale-95"
                          >
                            View Profile
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {paginated.length > 0 && qData && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
              <span className="text-sm text-muted-foreground">
                Showing {(qData.current_page - 1) * qData.page_size + 1}–
                {Math.min(qData.current_page * qData.page_size, qData.count)} of{" "}
                {qData.count}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (n) =>
                      n === 1 ||
                      n === totalPages ||
                      (n >= safePage - 1 && n <= safePage + 1),
                  )
                  .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                    if (
                      idx > 0 &&
                      typeof arr[idx - 1] === "number" &&
                      (n as number) - (arr[idx - 1] as number) > 1
                    ) {
                      acc.push("…");
                    }
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "…" ? (
                      <span
                        key={`e-${idx}`}
                        className="px-1 text-sm text-muted-foreground/70"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
                          safePage === item
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "border border-border text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
