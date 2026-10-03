import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { COMPARISON_ROWS, PLANS, TOP_UPS } from "@/features/pricing/lib/plans";

export const FAQ_PLACEHOLDERS = 6;
export const CUSTOM_FEATURES = 4;

const featureCount = (plan) => (plan.price === null ? CUSTOM_FEATURES : plan.topUps ? 3 : 2);

// Each bar is sized in lh units under the same text classes as the real copy,
// so a line of skeleton is exactly one line of text at every breakpoint.
// Flex keeps the bars' margins from collapsing into each other.
function Lines({ count = 1, className, gap, last = "w-2/3" }) {
  return (
    <div className={cn("flex flex-col", gap)}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          className={cn("my-[0.15lh] h-[0.7lh] rounded-sm", i === count - 1 && count > 1 ? last : "w-full", className)}
        />
      ))}
    </div>
  );
}

export function PricingSkeleton() {
  const { t } = useTranslation("common");
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div role="status" aria-busy="true" className="flex grow flex-col bg-bg-card">
      <span className="sr-only">{t("pageState.loading")}</span>
      {slow && (
        <p className="mx-auto w-full max-w-content px-4 pt-6 text-sm text-text-muted sm:px-6 lg:px-8 3xl:max-w-wide">
          {t("pageState.slow")}
        </p>
      )}

      <div aria-hidden="true" className="contents">
        <div className="order-first mx-auto w-full max-w-content px-4 pt-28 sm:px-6 md:pt-36 lg:px-8 3xl:max-w-wide 3xl:pt-44">
          <div className="w-16 text-sm 3xl:text-base">
            <Lines />
          </div>
          <div className="mt-3 max-w-[22ch] text-fluid-2xl leading-tight">
            <Lines count={2} last="w-3/5" />
          </div>
          <div className="mt-5 max-w-2xl text-fluid-base leading-relaxed 3xl:max-w-3xl">
            <Lines count={2} last="w-4/5" />
          </div>
          <div className="mt-8 flex flex-col gap-3 text-sm md:flex-row md:flex-wrap md:items-center md:gap-x-6">
            <div className="w-36">
              <Lines />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {["w-52", "w-44", "w-40"].map((width) => (
                <div key={width} className={width}>
                  <Lines />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-content px-4 pt-12 sm:px-6 md:pt-16 lg:px-8 3xl:max-w-wide">
          <div className="mx-auto grid max-w-md grid-cols-1 gap-4 md:max-w-none md:grid-cols-2 xl:grid-cols-4 3xl:gap-6">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                data-testid="plan-skeleton"
                className="row-span-4 grid grid-rows-subgrid gap-0 rounded-lg border-border py-0 shadow-none"
              >
                <CardHeader className="gap-1.5 px-6 pt-6 3xl:px-7 3xl:pt-7">
                  <div className="w-20 text-lg 3xl:text-xl">
                    <Lines />
                  </div>
                  <div className="w-44 text-sm leading-snug">
                    <Lines />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pt-6 3xl:px-7">
                  <div className="w-32 text-4xl 3xl:text-5xl">
                    <Lines />
                  </div>
                  <div className="mt-3 w-44 text-sm">
                    <Lines />
                  </div>
                </CardContent>
                <CardContent className="px-6 pt-6 3xl:px-7">
                  <div className="border-t border-border pt-5 text-sm leading-snug">
                    <Lines count={featureCount(plan)} gap="gap-3" last="w-1/2" />
                  </div>
                </CardContent>
                <CardFooter className="items-end px-6 pt-8 pb-6 3xl:px-7 3xl:pb-7">
                  <Skeleton className="h-11 w-full rounded-sm" />
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mx-auto mt-6 flex max-w-md flex-col gap-1 text-sm md:max-w-none">
            <Lines className="max-w-72" />
            <Lines className="max-w-md" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-content px-4 pt-20 sm:px-6 md:pt-28 lg:px-8 3xl:max-w-wide 3xl:pt-36">
          <div className="max-w-2xl">
            <div className="w-56 text-fluid-xl leading-tight">
              <Lines />
            </div>
            <div className="mt-3 text-base leading-relaxed">
              <Lines count={2} />
            </div>
          </div>
          <Skeleton className="mt-8 h-11 w-full md:hidden" />
          <Card className="mt-4 gap-0 overflow-hidden rounded-lg border-border py-0 shadow-none md:mt-10">
            <Table className="text-sm md:table-fixed 3xl:text-base">
              <TableHeader className="bg-bg-subtle">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="h-12 px-4 md:w-[34%] md:px-6">
                    <Skeleton className="h-[0.7lh] w-20 rounded-sm" />
                  </TableHead>
                  {PLANS.map((plan) => (
                    <TableHead key={plan.id} className={cn("h-12 px-4", !plan.featured && "max-md:hidden")}>
                      <Skeleton className="mx-auto h-[0.7lh] w-16 rounded-sm" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON_ROWS.map((row) => (
                  <TableRow key={row.id} data-testid="compare-skeleton" className="border-border hover:bg-transparent">
                    <TableHead className="h-auto px-4 py-3.5 md:px-6">
                      <Skeleton className="my-[0.15lh] h-[0.7lh] w-40 max-w-full rounded-sm" />
                    </TableHead>
                    {PLANS.map((plan) => (
                      <TableCell key={plan.id} className={cn("px-4 py-3.5", !plan.featured && "max-md:hidden")}>
                        <Skeleton className="mx-auto my-[0.15lh] h-[0.7lh] w-8 rounded-sm" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        <div className="mx-auto w-full max-w-content px-4 pt-20 sm:px-6 md:pt-28 lg:px-8 3xl:max-w-wide 3xl:pt-36">
          <div className="max-w-2xl">
            <div className="w-64 max-w-full text-fluid-xl leading-tight">
              <Lines />
            </div>
            <div className="mt-3 text-base leading-relaxed">
              <Lines count={2} last="w-1/3" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 xs:grid-cols-2 md:gap-4 lg:grid-cols-4 3xl:gap-6">
            {TOP_UPS.map((pack) => (
              <Card key={pack.credits} data-testid="top-up-skeleton" className="h-full gap-0 rounded-lg border-border py-0 shadow-none">
                <CardHeader className="px-5 pt-5 md:px-6 md:pt-6">
                  <div className="w-24 text-base">
                    <Lines />
                  </div>
                </CardHeader>
                <CardContent className="px-5 pt-3 md:px-6">
                  <div className="w-24 text-2xl 3xl:text-3xl">
                    <Lines />
                  </div>
                </CardContent>
                <CardFooter className="mt-auto px-5 pt-5 pb-5 md:px-6 md:pb-6">
                  <Skeleton className="h-11 w-full rounded-sm" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-content px-4 pt-20 sm:px-6 md:pt-28 lg:px-8 3xl:max-w-wide 3xl:pt-36">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
            <div>
              <div className="w-64 max-w-full text-fluid-xl leading-tight">
                <Lines />
              </div>
              <div className="mt-3 w-60 max-w-full text-base leading-relaxed">
                <Lines />
              </div>
            </div>
            <div className="border-t border-border">
              {Array.from({ length: FAQ_PLACEHOLDERS }, (_, i) => (
                <div key={i} data-testid="faq-skeleton" className="flex items-center justify-between gap-4 border-b border-border py-5 text-base">
                  <Skeleton className="my-[0.15lh] h-[0.7lh] w-3/5 rounded-sm" />
                  <Skeleton className="size-4 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-content px-4 py-20 sm:px-6 md:py-28 lg:px-8 3xl:max-w-wide 3xl:py-36">
          <Card className="gap-8 rounded-lg border-0 bg-brand-900 px-6 py-10 shadow-none md:flex-row md:items-center md:justify-between md:px-12 md:py-12 3xl:px-16 3xl:py-16">
            <div className="flex w-full max-w-xl flex-col gap-3">
              <div className="w-3/4 text-fluid-xl leading-tight">
                <Skeleton pulse className="my-[0.15lh] h-[0.7lh] rounded-sm bg-white/10" />
              </div>
              <div className="flex flex-col text-base leading-relaxed">
                <Skeleton pulse className="my-[0.15lh] h-[0.7lh] rounded-sm bg-white/10" />
                <Skeleton pulse className="my-[0.15lh] h-[0.7lh] w-2/3 rounded-sm bg-white/10" />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
              <Skeleton pulse className="h-11 w-full rounded-sm bg-white/10 sm:w-44" />
              <Skeleton pulse className="h-11 w-full rounded-sm bg-white/10 sm:w-36" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
