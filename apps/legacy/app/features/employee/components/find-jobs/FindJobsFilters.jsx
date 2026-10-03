import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, X, SlidersHorizontal, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const EMPLOYMENT_OPTIONS = [
  { value: "full_time", key: "fullTime" },
  { value: "part_time", key: "partTime" },
  { value: "internship", key: "internship" },
  { value: "contract", key: "contract" },
  { value: "freelance", key: "freelance" },
];

const FILTER_INPUT_CLASS =
  "h-auto rounded-md border-[1.5px] border-border bg-bg-subtle px-3 py-2 text-sm text-neutral-700 focus-visible:border-brand-500 focus-visible:bg-card focus-visible:ring-0";

function useDebouncedCallback(callback, delay = 400) {
  const timer = useRef(null);
  const debounced = (value) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => callback(value), delay);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return debounced;
}

// Pill button that opens a Popover. When a value is active it shows the value
// and an inline × to clear without opening the Popover.
function FilterChip({ label, activeLabel, onClear, children }) {
  const { t } = useTranslation("employee");
  const isActive = Boolean(activeLabel);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-auto gap-1.5 rounded-full border px-3.5 py-1.75 text-xs font-medium transition-colors",
            isActive
              ? "border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-50 hover:text-brand-600"
              : "border-border bg-card text-text-muted hover:border-brand-300 hover:text-text-body",
          )}
        >
          <span className="max-w-32 truncate">{isActive ? activeLabel : label}</span>
          {isActive ? (
            <span
              role="button"
              tabIndex={0}
              aria-label={t("findJobs.filter.clear")}
              className="flex items-center"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onClear(); }
              }}
            >
              <X size={11} strokeWidth={2.5} />
            </span>
          ) : (
            <ChevronDown size={12} strokeWidth={2} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-64 p-3">
        {children}
      </PopoverContent>
    </Popover>
  );
}

// Clickable option row inside a Popover — used for employment type and industry.
function OptionRow({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-start text-sm transition-colors hover:bg-bg-subtle",
        active ? "bg-brand-50 font-medium text-brand-600" : "text-text-muted",
      )}
    >
      {active ? (
        <Check size={13} strokeWidth={2.5} className="shrink-0" />
      ) : (
        <span className="size-[13px] shrink-0" />
      )}
      {label}
    </button>
  );
}

export default function FindJobsFilters({
  filters,
  onFilterChange,
  onClear,
  industries = [],
  industriesLoading = false,
}) {
  const { t } = useTranslation("employee");

  const [localLocation, setLocalLocation] = useState(filters.location || "");
  const [localSalary, setLocalSalary] = useState(filters.salary_range || "");
  const [localExperience, setLocalExperience] = useState(filters.experience_required || "");

  const debouncedLocation = useDebouncedCallback((v) => onFilterChange("location", v));
  const debouncedSalary = useDebouncedCallback((v) => onFilterChange("salary_range", v));
  const debouncedExperience = useDebouncedCallback((v) => onFilterChange("experience_required", v));

  const handleClearAll = () => {
    setLocalLocation("");
    setLocalSalary("");
    setLocalExperience("");
    onClear();
  };

  const activeCount = [
    filters.location,
    filters.employment_type,
    filters.industry_type,
    filters.salary_range,
    filters.experience_required,
  ].filter(Boolean).length;

  const activeEmploymentLabel = filters.employment_type
    ? t(`findJobs.filter.${EMPLOYMENT_OPTIONS.find((o) => o.value === filters.employment_type)?.key}`)
    : null;

  const activeIndustryLabel = filters.industry_type
    ? (industries.find((i) => i.value === filters.industry_type)?.label ?? filters.industry_type)
    : null;

  return (
    <>
      {/* Desktop: always-visible chip row */}
      <div className="mt-3 hidden flex-wrap items-center gap-2 lg:flex">
        <FilterChip
          label={t("findJobs.filter.location")}
          activeLabel={filters.location || null}
          onClear={() => { setLocalLocation(""); onFilterChange("location", ""); }}
        >
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold text-neutral-600">
              {t("findJobs.filter.location")}
            </Label>
            <Input
              autoFocus
              className={FILTER_INPUT_CLASS}
              placeholder={t("findJobs.filter.locationPlaceholder")}
              value={localLocation}
              onChange={(e) => { setLocalLocation(e.target.value); debouncedLocation(e.target.value); }}
              onKeyDown={(e) => { if (e.key === "Enter") onFilterChange("location", localLocation); }}
            />
          </div>
        </FilterChip>

        <FilterChip
          label={t("findJobs.filter.employmentType")}
          activeLabel={activeEmploymentLabel}
          onClear={() => onFilterChange("employment_type", "")}
        >
          <div className="flex flex-col">
            <p className="mb-1.5 text-xs font-semibold text-neutral-600">
              {t("findJobs.filter.employmentType")}
            </p>
            {EMPLOYMENT_OPTIONS.map((opt) => (
              <OptionRow
                key={opt.value}
                label={t(`findJobs.filter.${opt.key}`)}
                active={filters.employment_type === opt.value}
                onClick={() =>
                  onFilterChange("employment_type", filters.employment_type === opt.value ? "" : opt.value)
                }
              />
            ))}
          </div>
        </FilterChip>

        <FilterChip
          label={t("findJobs.filter.industry")}
          activeLabel={activeIndustryLabel}
          onClear={() => onFilterChange("industry_type", "")}
        >
          <div className="flex flex-col">
            <p className="mb-1.5 text-xs font-semibold text-neutral-600">
              {t("findJobs.filter.industry")}
            </p>
            {industriesLoading ? (
              <p className="px-3 py-2 text-sm text-neutral-400">{t("findJobs.filter.loading")}</p>
            ) : (
              <div className="max-h-52 overflow-y-auto">
                {industries.map((opt) => (
                  <OptionRow
                    key={opt.value}
                    label={opt.label}
                    active={filters.industry_type === opt.value}
                    onClick={() =>
                      onFilterChange("industry_type", filters.industry_type === opt.value ? "" : opt.value)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </FilterChip>

        <FilterChip
          label={t("findJobs.filter.salary")}
          activeLabel={filters.salary_range || null}
          onClear={() => { setLocalSalary(""); onFilterChange("salary_range", ""); }}
        >
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold text-neutral-600">
              {t("findJobs.filter.salary")}
            </Label>
            <Input
              autoFocus
              className={FILTER_INPUT_CLASS}
              placeholder={t("findJobs.filter.salaryPlaceholder")}
              value={localSalary}
              onChange={(e) => { setLocalSalary(e.target.value); debouncedSalary(e.target.value); }}
              onKeyDown={(e) => { if (e.key === "Enter") onFilterChange("salary_range", localSalary); }}
            />
          </div>
        </FilterChip>

        <FilterChip
          label={t("findJobs.filter.experience")}
          activeLabel={filters.experience_required || null}
          onClear={() => { setLocalExperience(""); onFilterChange("experience_required", ""); }}
        >
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold text-neutral-600">
              {t("findJobs.filter.experience")}
            </Label>
            <Input
              autoFocus
              className={FILTER_INPUT_CLASS}
              placeholder={t("findJobs.filter.experiencePlaceholder")}
              value={localExperience}
              onChange={(e) => { setLocalExperience(e.target.value); debouncedExperience(e.target.value); }}
              onKeyDown={(e) => { if (e.key === "Enter") onFilterChange("experience_required", localExperience); }}
            />
          </div>
        </FilterChip>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-auto gap-1 rounded-full px-3 py-1.75 text-xs text-text-muted hover:bg-danger-bg hover:text-danger"
          >
            <X size={12} strokeWidth={2.5} />
            {t("findJobs.filter.clearAll")}
          </Button>
        )}
      </div>

      {/* Mobile: Sheet drawer */}
      <div className="mt-3 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-auto w-full gap-2 rounded-md border-[1.5px] py-2.5 text-sm font-semibold",
                activeCount > 0
                  ? "border-brand-200 bg-brand-50 text-brand-600"
                  : "border-border bg-card text-text-muted",
              )}
            >
              <SlidersHorizontal size={15} strokeWidth={2.5} />
              {t("findJobs.filters")}
              {activeCount > 0 && (
                <Badge className="ms-1 rounded-full border-transparent bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="gap-0 rounded-t-2xl p-0"
            style={{ maxHeight: "85dvh" }}
            showCloseButton={false}
          >
            <SheetHeader className="border-b border-border px-4 py-3.5">
              <SheetTitle className="text-base font-semibold text-text-body">
                {t("findJobs.filters")}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="m-location" className="text-xs font-semibold text-neutral-600">
                    {t("findJobs.filter.location")}
                  </Label>
                  <Input
                    id="m-location"
                    className={FILTER_INPUT_CLASS}
                    placeholder={t("findJobs.filter.locationPlaceholder")}
                    value={localLocation}
                    onChange={(e) => { setLocalLocation(e.target.value); debouncedLocation(e.target.value); }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-neutral-600">
                    {t("findJobs.filter.employmentType")}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {EMPLOYMENT_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() =>
                          onFilterChange("employment_type", filters.employment_type === opt.value ? "" : opt.value)
                        }
                        className={cn(
                          "h-auto rounded-full border px-3.5 py-1.5 text-xs font-medium",
                          filters.employment_type === opt.value
                            ? "border-brand-200 bg-brand-50 text-brand-600"
                            : "border-border text-text-muted",
                        )}
                      >
                        {t(`findJobs.filter.${opt.key}`)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-neutral-600">
                    {t("findJobs.filter.industry")}
                  </Label>
                  <div className="max-h-40 overflow-y-auto rounded-md border border-border">
                    {industriesLoading ? (
                      <p className="px-3 py-2 text-sm text-neutral-400">{t("findJobs.filter.loading")}</p>
                    ) : (
                      industries.map((opt) => (
                        <OptionRow
                          key={opt.value}
                          label={opt.label}
                          active={filters.industry_type === opt.value}
                          onClick={() =>
                            onFilterChange("industry_type", filters.industry_type === opt.value ? "" : opt.value)
                          }
                        />
                      ))
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="m-salary" className="text-xs font-semibold text-neutral-600">
                    {t("findJobs.filter.salary")}
                  </Label>
                  <Input
                    id="m-salary"
                    className={FILTER_INPUT_CLASS}
                    placeholder={t("findJobs.filter.salaryPlaceholder")}
                    value={localSalary}
                    onChange={(e) => { setLocalSalary(e.target.value); debouncedSalary(e.target.value); }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="m-experience" className="text-xs font-semibold text-neutral-600">
                    {t("findJobs.filter.experience")}
                  </Label>
                  <Input
                    id="m-experience"
                    className={FILTER_INPUT_CLASS}
                    placeholder={t("findJobs.filter.experiencePlaceholder")}
                    value={localExperience}
                    onChange={(e) => { setLocalExperience(e.target.value); debouncedExperience(e.target.value); }}
                  />
                </div>
              </div>
            </div>

            <SheetFooter className="flex-row gap-2 border-t border-border px-4 py-3.5">
              <Button
                variant="outline"
                type="button"
                className="h-auto flex-1 rounded-md border-[1.5px] border-border py-2.5 text-sm font-semibold text-neutral-500 hover:border-danger-bg hover:bg-danger-bg hover:text-danger"
                onClick={handleClearAll}
              >
                <X size={14} className="me-1.5" />
                {t("findJobs.filter.clearAll")}
              </Button>
              <SheetClose asChild>
                <Button className="h-auto flex-1 rounded-md bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
                  {t("findJobs.filter.done")}
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
