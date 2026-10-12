import { Lock, LockOpen, Mail, Phone, UserRound, Video } from "lucide-react"

import { wait } from "@/components/art/delay"
import { Line } from "@/components/art/svg"

const SKILLS = [0.86, 0.72, 0.92, 0.64]
const VIEWERS = [312, 332, 352]

/** How LetsHyre works: a candidate interviews, a scorecard comes out, an employer unlocks the profile. */
export function HireFlow() {
  return (
    <svg
      viewBox="0 0 520 400"
      aria-hidden="true"
      className="w-full overflow-visible"
    >
      <circle cx={260} cy={200} r={196} className="fill-brand/5" />

      <path
        d="M216 100 C230 100 222 140 236 140"
        pathLength={1}
        strokeWidth={2}
        className="ink fill-none stroke-border"
      />
      <path
        d="M330 244 C330 282 286 282 224 282"
        pathLength={1}
        strokeWidth={2}
        className="ink fill-none stroke-border"
        style={wait(1300)}
      />

      <g className="rise">
        <rect
          x={16}
          y={40}
          width={200}
          height={120}
          rx={16}
          className="fill-card stroke-border drop-shadow-[0_12px_32px_rgb(15_23_42/0.08)]"
        />
        <circle cx={54} cy={80} r={18} className="fill-brand-muted" />
        <UserRound
          x={44}
          y={70}
          width={20}
          height={20}
          strokeWidth={2}
          className="text-brand-text"
        />
        <Line x={82} y={70} width={96} strong />
        <Line x={82} y={86} width={64} />
        <rect
          x={36}
          y={116}
          width={112}
          height={26}
          rx={13}
          className="fill-brand-muted"
        />
        <Video
          x={47}
          y={122}
          width={14}
          height={14}
          strokeWidth={2}
          className="text-brand-text"
        />
        <Line x={68} y={126} width={64} className="fill-brand-text/40" />
      </g>

      <g className="rise" style={wait(200)}>
        <rect
          x={236}
          y={24}
          width={268}
          height={220}
          rx={18}
          className="fill-card stroke-border drop-shadow-[0_16px_40px_rgb(15_23_42/0.08)]"
        />
        <Line x={260} y={48} width={120} strong />
        <Line x={260} y={64} width={80} />
        <circle
          cx={460}
          cy={62}
          r={22}
          strokeWidth={6}
          className="fill-none stroke-muted"
        />
        <path
          d="M460 40 A22 22 0 1 1 440.1 52.6"
          pathLength={1}
          strokeWidth={6}
          strokeLinecap="round"
          className="ink fill-none stroke-brand"
          style={wait(900)}
        />
        <Line x={450} y={59} width={20} strong />
        {SKILLS.map((score, i) => {
          const y = 104 + i * 26
          return (
            <g key={y}>
              <Line x={260} y={y - 3} width={52} />
              <rect
                x={326}
                y={y - 4}
                width={154}
                height={8}
                rx={4}
                className="fill-muted"
              />
              <rect
                x={326}
                y={y - 4}
                width={154 * score}
                height={8}
                rx={4}
                className="bar-in fill-brand"
                style={wait(700 + i * 120)}
              />
            </g>
          )
        })}
        <rect
          x={260}
          y={212}
          width={100}
          height={18}
          rx={9}
          className="fill-muted"
        />
        <circle cx={273} cy={221} r={3.5} className="fill-destructive" />
        <Line x={283} y={218} width={60} />
      </g>

      <g className="rise" style={wait(1200)}>
        <rect
          x={24}
          y={208}
          width={200}
          height={144}
          rx={16}
          className="fill-card stroke-border drop-shadow-[0_12px_32px_rgb(15_23_42/0.08)]"
        />
        <circle cx={62} cy={246} r={18} className="fill-muted" />
        <Lock
          x={53}
          y={237}
          width={18}
          height={18}
          strokeWidth={2}
          className="text-muted-foreground"
        />
        <g className="pop" style={wait(1900)}>
          <circle cx={62} cy={246} r={18} className="fill-primary" />
          <LockOpen
            x={53}
            y={237}
            width={18}
            height={18}
            strokeWidth={2}
            className="text-primary-foreground"
          />
        </g>
        <Line x={90} y={236} width={96} strong />
        <Line x={90} y={252} width={64} />
        {[Mail, Phone].map((Icon, i) => {
          const y = 296 + i * 28
          return (
            <g key={y}>
              <rect
                x={44}
                y={y - 10}
                width={160}
                height={20}
                rx={6}
                className="fill-muted"
              />
              <g className="rise" style={wait(2100 + i * 150)}>
                <Icon
                  x={52}
                  y={y - 6}
                  width={12}
                  height={12}
                  strokeWidth={2}
                  className="text-brand-text"
                />
                <Line x={72} y={y - 3} width={i ? 72 : 104} strong />
              </g>
            </g>
          )
        })}
      </g>

      <g className="rise" style={wait(2500)}>
        <g className="float" style={wait(2900)}>
          <rect
            x={292}
            y={286}
            width={196}
            height={52}
            rx={26}
            className="fill-card stroke-border drop-shadow-[0_8px_20px_rgb(15_23_42/0.08)]"
          />
          {VIEWERS.map((cx, i) => (
            <circle
              key={cx}
              cx={cx}
              cy={312}
              r={12}
              strokeWidth={3}
              className={
                i === 1
                  ? "fill-primary stroke-card"
                  : "fill-brand-muted stroke-card"
              }
            />
          ))}
          <Line x={376} y={302} width={88} strong />
          <Line x={376} y={316} width={60} />
        </g>
      </g>
    </svg>
  )
}
