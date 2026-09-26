import { useState } from "react";
import { Search, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useUnlockedProfiles } from "../../../hooks/useUnlocks";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../legacy-ui/table";

export default function UnlocksTable() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading, isError } = useUnlockedProfiles({
    page,
    search: activeSearch || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  });

  const handleSearch = () => {
    setActiveSearch(searchInput);
    setPage(1);
  };

  const getInitials = (name: string) => {
    if (!name) return "NA";
    return name.substring(0, 2).toUpperCase();
  };

  const ScoreRing = ({ score }: { score: number }) => {
    const r = 16;
    const c = 2 * Math.PI * r;
    const offset = c - (score / 100) * c;
    const colorClass =
      score >= 80
        ? "stroke-green-500"
        : score >= 60
          ? "stroke-yellow-500"
          : "stroke-red-500";

    return (
      <div className="relative flex h-10 w-10 items-center justify-center">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r={r}
            className="stroke-border"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="20"
            cy="20"
            r={r}
            className={colorClass}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute text-xs font-bold dark:text-white">
          {score}
        </span>
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-border p-5 xl:flex-row xl:items-center">
        <h3 className="text-lg font-semibold text-foreground">
          Unlocked Candidates
        </h3>

        <div className="flex w-full flex-wrap items-center gap-3 xl:w-auto">
          <div className="relative flex-1 xl:flex-none">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full rounded-lg border border-border bg-muted/50 py-2 pr-4 pl-9 text-sm transition-shadow focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:text-white"
            />
          </div>
          <button
            onClick={handleSearch}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden"
          >
            Search
          </button>

          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:text-white"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:text-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full text-left text-sm whitespace-nowrap">
          <TableHeader className="border-b border-border bg-muted/50">
            <TableRow>
              <TableCell
                isHeader
                className="px-6 py-4 text-left font-medium text-muted-foreground"
              >
                Employer
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-4 text-left font-medium text-muted-foreground"
              >
                Candidate
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-4 text-left font-medium text-muted-foreground"
              >
                Contact
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-4 text-left font-medium text-muted-foreground"
              >
                Unlocked Date
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-4 text-center font-medium text-muted-foreground"
              >
                AI Score
              </TableCell>
              <TableCell
                isHeader
                className="px-6 py-4 text-right font-medium text-muted-foreground"
              >
                Resume
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  Loading data...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-6 py-8 text-center text-red-500"
                >
                  Failed to load data.
                </TableCell>
              </TableRow>
            ) : data?.results?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  No unlocked candidates found.
                </TableCell>
              </TableRow>
            ) : (
              data?.results.map((row, idx) => (
                <TableRow
                  key={idx}
                  className="border-b border-border transition-colors hover:bg-accent/50"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {getInitials(row.employer)}
                      </div>
                      <span className="max-w-[150px] truncate font-medium text-foreground">
                        {row.employer}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        {getInitials(row.candidate_name)}
                      </div>
                      <span className="max-w-[150px] truncate font-medium text-foreground">
                        {row.candidate_name || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-foreground">
                        {row.candidate_email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {row.candidate_phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    {new Date(row.unlocked_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="flex justify-center px-6 py-4">
                    <ScoreRing
                      score={parseFloat(row.ai_overall_score || "0")}
                    />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          row.candidate_resume &&
                          window.open(row.candidate_resume, "_blank")
                        }
                        disabled={!row.candidate_resume}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(page - 1) * data.page_size + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(page * data.page_size, data.count)}
            </span>{" "}
            of <span className="font-medium text-foreground">{data.count}</span>{" "}
            results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm font-medium text-foreground">
              Page {page} of {data.total_pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page === data.total_pages}
              className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
