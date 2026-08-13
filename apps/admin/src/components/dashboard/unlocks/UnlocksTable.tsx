import { useState } from "react";
import { Search, Download, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useUnlockedProfiles } from "../../../hooks/useUnlocks";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../ui/table";

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
    const colorClass = score >= 80 ? "stroke-green-500" : score >= 60 ? "stroke-yellow-500" : "stroke-red-500";
    
    return (
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={r} className="stroke-gray-100 dark:stroke-gray-800" strokeWidth="3" fill="none" />
          <circle cx="20" cy="20" r={r} className={colorClass} strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
        </svg>
        <span className="absolute text-xs font-bold dark:text-white">{score}</span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unlocked Candidates</h3>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search candidates..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-shadow"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </button>
          
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
          
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full text-left text-sm whitespace-nowrap">
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 text-left">Employer</TableCell>
              <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 text-left">Candidate</TableCell>
              <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 text-left">Contact</TableCell>
              <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 text-left">Unlocked Date</TableCell>
              <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 text-center">AI Score</TableCell>
              <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 text-right">Resume</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Loading data...</TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-8 text-center text-red-500">Failed to load data.</TableCell>
              </TableRow>
            ) : data?.results?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No unlocked candidates found.</TableCell>
              </TableRow>
            ) : (
              data?.results.map((row, idx) => (
                <TableRow key={idx} className="border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {getInitials(row.employer)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{row.employer}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {getInitials(row.candidate_name)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{row.candidate_name || "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white">{row.candidate_email}</span>
                      <span className="text-gray-500 text-xs">{row.candidate_phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {new Date(row.unlocked_date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                  </TableCell>
                  <TableCell className="px-6 py-4 flex justify-center">
                    <ScoreRing score={parseFloat(row.ai_overall_score || "0")} />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => row.candidate_resume && window.open(row.candidate_resume, '_blank')}
                        disabled={!row.candidate_resume}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FileText className="w-3.5 h-3.5" />
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

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium text-gray-900 dark:text-white">{(page - 1) * data.page_size + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(page * data.page_size, data.count)}</span> of <span className="font-medium text-gray-900 dark:text-white">{data.count}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-900 dark:text-white px-2">
              Page {page} of {data.total_pages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
              disabled={page === data.total_pages}
              className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
