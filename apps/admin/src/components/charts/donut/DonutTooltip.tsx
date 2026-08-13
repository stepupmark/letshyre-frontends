/**
 * DonutTooltip.tsx
 *
 * Custom Recharts tooltip for donut charts.
 * Shows: label, count, and percentage in a styled floating card.
 */

import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
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
    <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-xl px-4 py-3 shadow-2xl border border-white/10 backdrop-blur-sm text-sm min-w-[140px]">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: slice.color }}
        />
        <span className="font-semibold truncate">{slice.label}</span>
      </div>
      <div className="text-gray-300 text-xs space-y-0.5 pl-[18px]">
        <div>
          Count: <span className="text-white font-medium">{slice.count}</span>
        </div>
        <div>
          Share:{" "}
          <span className="text-white font-medium">{slice.percentage}%</span>
        </div>
      </div>
    </div>
  );
}
