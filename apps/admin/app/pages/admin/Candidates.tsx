import { useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";

import {
  useCandidateCards,
  useCandidates,
} from "../../hooks/useCandidates";
import { 
  ChevronRight, 
  FileIcon, 
  Users, 
  Calendar, 
  Target, 
  AlertTriangle, 
  ShieldCheck 
} from "lucide-react";
import { formatDate } from "../../lib/formatDate";

const INDUSTRY_OPTIONS = [
  "IT / Software Development",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Marketing",
  "Design & Creative",
  "Logistics & Supply Chain",
];

const GENDER_OPTIONS = ["Male", "Female", "Other"];

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

export default function Candidates() {
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [filterVerified, setFilterVerified] = useState("");
  const [filterComplete, setFilterComplete] = useState("");
  const [page, setPage] = useState(1);

  const {
    data: qData,
    isLoading,
    isError,
  } = useCandidates(
    page,
    search,
    filterGender,
    filterIndustry,
    filterVerified,
    filterComplete,
  );

  const { data: cardsData, isLoading: cardsLoading } =
    useCandidateCards();

  const cards = cardsData?.data;
  console.log("cards data", cards);

  const paginated = qData?.results || [];
  const totalPages = qData?.total_pages || 1;
  const safePage = Math.min(page, totalPages);

  const hasFilters =
    search ||
    filterGender ||
    filterIndustry ||
    filterVerified ||
    filterComplete;

  function clearAll() {
    setSearch("");
    setFilterGender("");
    setFilterIndustry("");
    setFilterVerified("");
    setFilterComplete("");
    setPage(1);
  }

  return (
    <>
      <PageMeta
        title="LetsHyre Admin – Candidates"
        description="Browse and manage all candidates"
      />

      <div className="space-y-5 overflow-x-hidden bg-muted/50">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Candidates
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Browse, search and manage registered candidates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Total Candidates",
              value: cards?.total_candidates || 0,
              icon: <Users className="size-5 text-indigo-600 dark:text-indigo-400" />,
              bg: "bg-indigo-50 dark:bg-indigo-900/20",
              border: "border-indigo-100 dark:border-indigo-800",
              accent: "from-indigo-500 to-indigo-600",
            },
            {
              label: "Today Joined",
              value: cards?.today_registrations || 0,
              icon: <Calendar className="size-5 text-emerald-600 dark:text-emerald-400" />,
              bg: "bg-emerald-50 dark:bg-emerald-900/20",
              border: "border-emerald-100 dark:border-emerald-800",
              accent: "from-emerald-500 to-emerald-600",
            },
            {
              label: "Completed",
              value: cards?.completed_profiles || 0,
              icon: <Target className="size-5 text-blue-600 dark:text-blue-400" />,
              bg: "bg-blue-50 dark:bg-blue-900/20",
              border: "border-blue-100 dark:border-blue-800",
              accent: "from-blue-500 to-blue-600",
            },
            {
              label: "Incomplete",
              value: cards?.in_completed_profiles || 0,
              icon: <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />,
              bg: "bg-amber-50 dark:bg-amber-900/20",
              border: "border-amber-100 dark:border-amber-800",
              accent: "from-amber-500 to-amber-600",
            },
            {
              label: "Verified",
              value: cards?.verified_candidates || 0,
              icon: <ShieldCheck className="size-5 text-purple-600 dark:text-purple-400" />,
              bg: "bg-purple-50 dark:bg-purple-900/20",
              border: "border-purple-100 dark:border-purple-800",
              accent: "from-purple-500 to-purple-600",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="relative overflow-hidden group rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${card.accent} opacity-70 transition-opacity duration-300 group-hover:opacity-100`}
              />

              <div className="flex items-start justify-between gap-4 mt-1">
                <div>
                  <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    {card.label}
                  </p>

                  <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
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

        <div className="px-5 py-4 bg-card border border-border shadow-xs rounded-2xl">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                id="candidate-search"
                type="text"
                placeholder="Search by name, email or industry…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-border bg-muted/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-ring focus:bg-card focus:outline-hidden focus:ring-2 focus:ring-ring/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <select
                id="filter-gender"
                value={filterGender}
                onChange={(e) => {
                  setFilterGender(e.target.value);
                  console.log("ssss gender ", e.target.value);
                  setPage(1);
                }}
                className="py-2 text-sm text-foreground transition bg-card border border-border shadow-xs rounded-xl focus:border-ring focus:outline-hidden focus:ring-2 focus:ring-ring/50"
              >
                <option value="">All Genders</option>
                {GENDER_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>

              <select
                id="filter-industry"
                value={filterIndustry}
                onChange={(e) => {
                  setFilterIndustry(e.target.value);
                  setPage(1);
                }}
                className="py-2 text-sm text-foreground transition bg-card border border-border shadow-xs rounded-xl focus:border-ring focus:outline-hidden focus:ring-2 focus:ring-ring/50"
              >
                <option value="">All Industries</option>
                {INDUSTRY_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>

              <select
                id="filter-verified"
                value={filterVerified}
                onChange={(e) => {
                  setFilterVerified(e.target.value);
                  setPage(1);
                }}
                className="py-2 text-sm text-foreground transition bg-card border border-border shadow-xs rounded-xl focus:border-ring focus:outline-hidden focus:ring-2 focus:ring-ring/50"
              >
                <option value="">KYC: All</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>

              <select
                id="filter-complete"
                value={filterComplete}
                onChange={(e) => {
                  setFilterComplete(e.target.value);
                  setPage(1);
                }}
                className="py-2 text-sm text-foreground transition bg-card border border-border shadow-xs rounded-xl focus:border-ring focus:outline-hidden focus:ring-2 focus:ring-ring/50"
              >
                <option value="">Profile: All</option>
                <option value="complete">Complete</option>
                <option value="incomplete">Incomplete</option>
              </select>

              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 px-3 py-2 ml-auto text-sm font-medium text-muted-foreground transition bg-card border border-border shadow-xs rounded-xl hover:border-rose-300 hover:text-rose-500"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-hidden bg-card border border-border shadow-xs rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Candidate",
                    "Email",
                    "Phone",
                    "Gender",
                    "Resume",
                    "Verfication Status",
                    "Enrollment Date",
                    "Profile",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-5 py-4 text-xs font-semibold tracking-widest text-left text-muted-foreground uppercase"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl animate-spin">⏳</span>
                        <p className="text-sm font-medium text-muted-foreground">
                          Loading candidates...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">⚠️</span>
                        <p className="text-sm font-medium text-muted-foreground">
                          Failed to load candidates.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">🔍</span>
                        <p className="text-sm font-medium text-muted-foreground">
                          No candidates match your filters.
                        </p>
                        <button
                          onClick={clearAll}
                          className="mt-1 text-xs text-primary hover:text-primary"
                        >
                          Clear filters →
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((c, idx) => {
                    const grad = avatarGradient(c.name);
                    return (
                      <tr
                        key={c.id}
                        className={`group transition-colors hover:bg-accent ${idx !== paginated.length - 1 ? "border-b border-border" : ""}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${grad} text-xs font-bold text-white shadow-xs`}
                            >
                              {initials(c.name)}
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                              {c.name || "Unknown"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {c.email}
                        </td>

                        <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {c.phone_number || "—"}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {c.gender ? (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${c.gender === "Female" ? "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400" : "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400"}`}
                            >
                              {c.gender}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground/70">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {c.resume ? (
                            <a
                              href={c.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10"
                            >
                              <FileIcon className="size-3" />
                              View
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              N/A
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              c.is_verified
                                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {c.is_verified ? "Verified" : "Pending"}
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(c.created_at)}
                          </span>
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {c.is_profile_complete ? (
                            <Link
                              to={`/dashboard/candidates/${c.id}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90 active:scale-95"
                            >
                              View Profile
                              <ChevronRight className="size-4" />
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-amber-500 text-sm font-semibold">
                              Incomplete
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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
                  aria-label="Go to previous page"
                  className="flex items-center justify-center w-8 h-8 text-muted-foreground transition border border-border rounded-lg hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <svg
                    className="w-4 h-4"
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
                    )
                      acc.push("…");
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
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${safePage === item ? "bg-primary text-primary-foreground shadow-xs" : "border border-border text-muted-foreground hover:bg-accent"}`}
                      >
                        {item}
                      </button>
                    ),
                  )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  aria-label="Go to next page"
                  className="flex items-center justify-center w-8 h-8 text-muted-foreground transition border border-border rounded-lg hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <svg
                    className="w-4 h-4"
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
