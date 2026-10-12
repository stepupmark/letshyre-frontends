import { BriefcaseBusiness, ClipboardCheck, Mic, UserRound } from "lucide-react"

import { Bar, IconDot, Line, Panel, Rise, ScoreRing, Tick } from "./svg"

const VIEW = "0 0 480 400"

/** Both sides meeting at one interview scorecard. */
export function GeneralScene() {
  return (
    <svg viewBox={VIEW} aria-hidden="true" className="w-full overflow-visible">
      <path
        d="M112 140 C112 190 190 186 200 228"
        pathLength={1}
        strokeWidth={1.5}
        className="draw fill-none stroke-brand/40"
      />
      <path
        d="M368 140 C368 190 290 186 280 228"
        pathLength={1}
        strokeWidth={1.5}
        className="draw fill-none stroke-brand/40"
      />

      <Panel x={24} y={36} width={176} height={104}>
        <IconDot cx={60} cy={72} icon={BriefcaseBusiness} />
        <Line x={88} y={64} width={84} strong />
        <Line x={88} y={80} width={60} />
        {[48, 64, 80].map((cx) => (
          <circle
            key={cx}
            cx={cx}
            cy={114}
            r={9}
            strokeWidth={2}
            className="fill-brand-muted stroke-card"
          />
        ))}
        <Line x={100} y={111} width={60} />
      </Panel>

      <Panel x={280} y={36} width={176} height={104} wait={120}>
        <IconDot cx={316} cy={72} icon={Mic} />
        <Line x={344} y={64} width={84} strong />
        <Line x={344} y={80} width={56} />
        <rect
          x={304}
          y={110}
          width={128}
          height={6}
          rx={3}
          className="fill-muted"
        />
        <Bar x={304} y={110} width={96} height={6} className="fill-brand" />
      </Panel>

      <Panel x={128} y={228} width={224} height={140} wait={300}>
        <ScoreRing cx={184} cy={298} r={30} value={84} />
        <Line x={228} y={270} width={96} strong />
        <Line x={228} y={286} width={72} />
        {[90, 74, 82].map((width, i) => (
          <g key={width}>
            <rect
              x={228}
              y={308 + i * 14}
              width={108}
              height={5}
              rx={2.5}
              className="fill-muted"
            />
            <Bar
              x={228}
              y={308 + i * 14}
              width={width}
              height={5}
              wait={500 + i * 80}
              className="fill-brand"
            />
          </g>
        ))}
      </Panel>

      <Tick cx={352} cy={232} r={14} wait={900} />
      <Rise wait={600} className="float">
        <circle cx={70} cy={300} r={5} className="fill-brand/30" />
        <circle cx={420} cy={320} r={3.5} className="fill-brand/40" />
      </Rise>
    </svg>
  )
}

const RANKED = [84, 79, 76]
const WEEK = [34, 52, 40, 62, 46]

/** A shortlist that arrives already interviewed and ranked. */
export function EmployerScene() {
  return (
    <svg viewBox={VIEW} aria-hidden="true" className="w-full overflow-visible">
      <Panel x={30} y={30} width={320} height={276}>
        <Line x={54} y={56} width={110} strong />
        <rect
          x={276}
          y={50}
          width={52}
          height={18}
          rx={9}
          className="fill-brand-muted"
        />
        <rect
          x={290}
          y={57}
          width={24}
          height={4}
          rx={2}
          className="fill-brand-text/60"
        />
        <rect x={30} y={84} width={320} height={1} className="fill-border" />
      </Panel>

      {RANKED.map((score, i) => {
        const top = 96 + i * 68
        const first = i === 0
        return (
          <Rise key={score} wait={180 + i * 110}>
            {first && (
              <rect
                x={42}
                y={top}
                width={296}
                height={60}
                rx={12}
                className="fill-brand-muted/60"
              />
            )}
            <circle
              cx={74}
              cy={top + 30}
              r={16}
              className={first ? "fill-card" : "fill-brand-muted"}
            />
            <UserRound
              x={66}
              y={top + 22}
              width={16}
              height={16}
              strokeWidth={2}
              className="text-brand-text"
            />
            <Line x={102} y={top + 21} width={first ? 112 : 96} strong />
            <Line x={102} y={top + 35} width={first ? 74 : 64} />
            <rect
              x={278}
              y={top + 19}
              width={46}
              height={22}
              rx={11}
              className={first ? "fill-primary" : "fill-card stroke-border"}
            />
            <text
              x={301}
              y={top + 30}
              textAnchor="middle"
              dominantBaseline="central"
              className={`text-[12px] font-semibold tabular-nums ${first ? "fill-primary-foreground" : "fill-foreground"}`}
            >
              {score}
            </text>
          </Rise>
        )
      })}

      <Panel x={334} y={250} width={140} height={124} wait={520}>
        <Line x={352} y={272} width={64} strong />
        {WEEK.map((height, i) => (
          <Bar
            key={i}
            vertical
            x={352 + i * 22}
            y={350 - height}
            width={12}
            height={height}
            wait={700 + i * 70}
            className={
              height === Math.max(...WEEK) ? "fill-brand" : "fill-brand-muted"
            }
          />
        ))}
      </Panel>

      <Tick cx={350} cy={34} r={14} wait={1000} className="float" />
    </svg>
  )
}

const MATCHES = [80, 64, 72]

/** One interview, a scorecard, then roles that fit. */
export function CandidateScene() {
  const steps = [
    { cx: 76, cy: 326, icon: Mic, done: true },
    { cx: 240, cy: 204, icon: ClipboardCheck, done: true },
    { cx: 404, cy: 92, icon: BriefcaseBusiness, done: false },
  ]

  return (
    <svg viewBox={VIEW} aria-hidden="true" className="w-full overflow-visible">
      <path
        d="M76 326 C160 326 150 204 240 204 S330 92 404 92"
        pathLength={1}
        strokeWidth={2}
        strokeLinecap="round"
        className="draw fill-none stroke-brand/45"
      />

      {steps.map(({ cx, cy, icon, done }, i) => (
        <Rise key={cx} wait={200 + i * 220}>
          <circle cx={cx} cy={cy} r={26} className="fill-card stroke-border" />
          {!done && (
            <circle
              cx={cx}
              cy={cy}
              r={32}
              strokeWidth={1.5}
              className="float fill-none stroke-brand/50"
            />
          )}
          <IconDot cx={cx} cy={cy} r={19} icon={icon} />
          {done && (
            <Tick cx={cx + 19} cy={cy - 19} r={9} wait={420 + i * 220} />
          )}
        </Rise>
      ))}

      <Panel x={28} y={52} width={184} height={104} wait={500}>
        <ScoreRing cx={76} cy={104} r={28} value={82} />
        <Line x={120} y={86} width={70} strong />
        <Line x={120} y={102} width={54} />
        <Line x={120} y={116} width={62} />
      </Panel>

      <Panel x={268} y={240} width={188} height={124} wait={760}>
        {MATCHES.map((width, i) => (
          <g key={width}>
            <rect
              x={286}
              y={258 + i * 32}
              width={22}
              height={22}
              rx={7}
              className="fill-brand-muted"
            />
            <Line x={318} y={262 + i * 32} width={width} strong />
            <Line x={318} y={274 + i * 32} width={width - 24} />
          </g>
        ))}
        <Tick cx={432} cy={269} r={9} wait={1100} />
      </Panel>
    </svg>
  )
}
