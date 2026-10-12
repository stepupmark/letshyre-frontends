import { Camera, Mic, MonitorUp } from "lucide-react"

import { wait } from "@/components/art/delay"
import { IconDot } from "@/components/art/svg"

/** Camera, microphone and screen, each with its recording light. */
export function RecordArt() {
  return (
    <svg viewBox="0 0 168 56" aria-hidden="true" className="w-40">
      {[Camera, Mic, MonitorUp].map((icon, i) => {
        const cx = 28 + i * 56
        return (
          <g key={cx}>
            <IconDot cx={cx} cy={28} r={20} icon={icon} />
            <circle
              cx={cx + 15}
              cy={13}
              r={5}
              strokeWidth={2.5}
              className="pop-in fill-destructive stroke-card"
              style={wait(i * 80)}
            />
          </g>
        )
      })}
    </svg>
  )
}
