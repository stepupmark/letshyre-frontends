import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatNumberFor } from "@/i18n/format";
import { useLocale } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { COMPARISON_ROWS } from "@/features/pricing/lib/plans";
import { usePlans } from "@/features/pricing/hooks/usePlans";

function ComparisonValue({ value }) {
  const { t } = useTranslation("pricing");
  const lang = useLocale();

  if (value === true || value === false) {
    const Icon = value ? Check : Minus;
    return (
      <>
        <Icon
          className={cn("mx-auto size-4.5", value ? "text-brand-600" : "text-text-faint")}
          aria-hidden="true"
        />
        <span className="sr-only">
          {value ? t("compare.values.included") : t("compare.values.notIncluded")}
        </span>
      </>
    );
  }
  if (value === null) return t("compare.values.custom");
  if (typeof value === "number") return formatNumberFor(lang, value);
  return t(`compare.values.${value}`);
}

export function PlanComparison() {
  const { t } = useTranslation("pricing");
  const { plans } = usePlans();
  const [picked, setPicked] = useState(null);
  const selected = plans.some((plan) => plan.id === picked)
    ? picked
    : (plans.find((plan) => plan.featured) ?? plans[0]).id;

  return (
    <section
      aria-labelledby="compare-title"
      className="mx-auto w-full max-w-content px-4 pt-20 sm:px-6 md:pt-28 lg:px-8 3xl:max-w-wide 3xl:pt-36"
    >
      <div className="max-w-2xl">
        <h2 id="compare-title" className="text-fluid-xl leading-tight font-bold tracking-tight text-text-main">
          {t("compare.title")}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-text-muted">{t("compare.body")}</p>
      </div>

      <ToggleGroup
        type="single"
        variant="outline"
        value={selected}
        onValueChange={(value) => value && setPicked(value)}
        aria-label={t("compare.picker")}
        className="mt-8 w-full bg-card md:hidden"
      >
        {plans.map((plan) => (
          <ToggleGroupItem
            key={plan.id}
            value={plan.id}
            className="h-11 flex-1 border-border text-text-muted data-[state=on]:bg-brand-900 data-[state=on]:text-white"
          >
            {t(`plans.${plan.id}.name`, { defaultValue: plan.name })}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Card className="mt-4 gap-0 overflow-hidden rounded-lg border-border py-0 shadow-none md:mt-10">
        <Table className="text-sm md:table-fixed 3xl:text-base">
          <TableCaption className="sr-only">{t("compare.caption")}</TableCaption>
          <TableHeader className="bg-bg-subtle">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead scope="col" className="h-12 px-4 font-semibold text-text-muted md:w-[34%] md:px-6">
                {t("compare.feature")}
              </TableHead>
              {plans.map((plan) => (
                <TableHead
                  key={plan.id}
                  scope="col"
                  className={cn(
                    "h-12 px-4 text-center font-semibold text-text-main",
                    plan.featured && "bg-brand-100",
                    plan.id !== selected && "max-md:hidden",
                  )}
                >
                  {t(`plans.${plan.id}.name`, { defaultValue: plan.name })}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {COMPARISON_ROWS.map((row) => (
              <TableRow key={row.id} className="border-border hover:bg-transparent">
                <TableHead
                  scope="row"
                  className="h-auto px-4 py-3.5 font-normal whitespace-normal text-text-body md:px-6"
                >
                  {t(`compare.rows.${row.id}`)}
                </TableHead>
                {plans.map((plan) => (
                  <TableCell
                    key={plan.id}
                    className={cn(
                      "px-4 py-3.5 text-center text-text-body tabular-nums",
                      plan.featured && "bg-brand-100/50",
                      plan.id !== selected && "max-md:hidden",
                    )}
                  >
                    <ComparisonValue value={row.value(plan)} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
}
