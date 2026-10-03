import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Shared shell for every report section — anchor id (for the TOC), an icon +
 * heading, and consistent card padding. Every section on the page composes
 * this instead of styling its own card.
 */
export function ReportSection({ id, icon: Icon, title, action, className, children }) {
  return (
    <Card id={id} className={cn("scroll-mt-24 gap-4 py-5 sm:py-6", className)}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2.5 text-base font-bold text-text-main sm:text-lg">
          {Icon && <Icon size={19} strokeWidth={2.2} className="shrink-0 text-brand-600" aria-hidden="true" />}
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default ReportSection;
