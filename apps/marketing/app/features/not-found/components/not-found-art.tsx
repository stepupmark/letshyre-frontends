import { SearchX, X } from "lucide-react"

import { wait } from "@/components/art/delay"
import { IconDot, Line } from "@/components/art/svg"

/** A browser window with nothing where the page should be, and a scorecard marked "no match". */
export function NotFoundArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" aria-hidden="true" className={className}>
      <g className="rise">
        <rect
          x={12}
          y={16}
          width={248}
          height={176}
          rx={14}
          className="fill-card stroke-border"
        />
        {[28, 40, 52].map((cx) => (
          <circle
            key={cx}
            cx={cx}
            cy={30}
            r={3.5}
            className="fill-muted-foreground/25"
          />
        ))}
        <rect x={12} y={44} width={248} height={1} className="fill-border" />
        <rect
          x={36}
          y={62}
          width={200}
          height={108}
          rx={10}
          strokeWidth={1.5}
          strokeDasharray="6 6"
          className="fill-muted/40 stroke-muted-foreground/35"
        />
        <g className="float">
          <IconDot cx={136} cy={116} r={22} icon={SearchX} />
        </g>
      </g>

      <g className="rise" style={wait(150)}>
        <rect
          x={176}
          y={118}
          width={132}
          height={104}
          rx={12}
          className="fill-card stroke-border"
        />
        <Line x={192} y={136} width={64} strong />
        <Line x={192} y={152} width={92} />
        <Line x={192} y={166} width={72} />
        <rect
          x={192}
          y={190}
          width={100}
          height={8}
          rx={4}
          className="fill-muted"
        />
        <rect
          x={192}
          y={190}
          width={28}
          height={8}
          rx={4}
          className="fill-destructive/50"
        />
      </g>

      <g className="pop" style={wait(450)}>
        <circle
          cx={290}
          cy={124}
          r={18}
          strokeWidth={2}
          className="fill-background stroke-destructive"
        />
        <X
          x={280}
          y={114}
          width={20}
          height={20}
          strokeWidth={2.5}
          className="text-destructive"
        />
      </g>
    </svg>
  )
}
