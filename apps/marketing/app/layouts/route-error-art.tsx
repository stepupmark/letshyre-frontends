import { CloudOff, TriangleAlert } from "lucide-react"

import { wait } from "@/components/art/delay"
import { IconDot, Line } from "@/components/art/svg"

/** A browser window stuck half-loaded, with an alert popping up over it. */
export function RouteErrorArt({ className }: { className?: string }) {
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
        <Line x={36} y={64} width={120} strong />
        <Line x={36} y={80} width={180} />
        <Line x={36} y={94} width={150} />
        <rect
          x={36}
          y={112}
          width={200}
          height={58}
          rx={10}
          strokeWidth={1.5}
          strokeDasharray="6 6"
          className="fill-muted/40 stroke-muted-foreground/35"
        />
        <g className="float">
          <IconDot cx={136} cy={141} r={18} icon={CloudOff} />
        </g>
      </g>

      <g className="rise" style={wait(150)}>
        <rect
          x={168}
          y={150}
          width={140}
          height={72}
          rx={12}
          className="fill-card stroke-border drop-shadow-sm"
        />
        <circle cx={192} cy={174} r={12} className="fill-destructive/10" />
        <TriangleAlert
          x={184}
          y={166}
          width={16}
          height={16}
          strokeWidth={2.25}
          className="text-destructive"
        />
        <Line x={212} y={168} width={76} strong />
        <Line x={212} y={182} width={56} />
        <rect
          x={184}
          y={200}
          width={52}
          height={10}
          rx={5}
          className="fill-muted"
        />
      </g>
    </svg>
  )
}
