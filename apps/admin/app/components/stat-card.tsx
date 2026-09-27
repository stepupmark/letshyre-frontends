import type { ReactNode } from "react";
import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  hint?: ReactNode;
  loading?: boolean;
  /** Makes the whole card a link, e.g. to the filtered list behind the number. */
  href?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  loading = false,
  href,
}: StatCardProps) {
  const card = (
    <Card
      className={
        href ? "h-full transition-colors hover:bg-muted/40" : undefined
      }
    >
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        {Icon && (
          <CardAction>
            <Icon className="size-4 text-muted-foreground" />
          </CardAction>
        )}
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {loading ? <Skeleton className="h-8 w-20" /> : value}
        </CardTitle>
        {hint && !loading && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </CardHeader>
    </Card>
  );

  return href ? (
    <Link
      to={href}
      className="rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {card}
    </Link>
  ) : (
    card
  );
}
