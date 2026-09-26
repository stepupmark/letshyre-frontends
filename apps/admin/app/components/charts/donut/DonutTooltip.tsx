import type { TooltipProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type { ChartSlice } from "../../../lib/chartTransformers";

interface CustomPayload {
  payload: ChartSlice;
  name: string;
  value: number;
}

type Props = TooltipProps<ValueType, NameType> & {
  active?: boolean;
  payload?: CustomPayload[];
};

export default function DonutTooltip({ active, payload }: Props) {
  if (!active || !payload?.length) return null;

  const slice = payload[0].payload;

  return (
    <div className="min-w-[140px] rounded-xl border border-background/10 bg-primary px-4 py-3 text-sm text-primary-foreground shadow-2xl backdrop-blur-xs">
      <div className="mb-1 flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: slice.color }}
        />
        <span className="truncate font-semibold">{slice.label}</span>
      </div>
      <div className="space-y-0.5 pl-[18px] text-xs text-muted-foreground/70">
        <div>
          Count: <span className="font-medium text-white">{slice.count}</span>
        </div>
        <div>
          Share:{" "}
          <span className="font-medium text-white">{slice.percentage}%</span>
        </div>
      </div>
    </div>
  );
}
