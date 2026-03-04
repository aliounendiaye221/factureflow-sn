'use client'

import { useMemo } from 'react'

type MonthData = { month: string; revenue: number }

const CHART_HEIGHT = 140
const BAR_WIDTH = 32
const GAP = 16

function shortMonth(iso: string) {
  // iso = "2025-03" → "Mar."
  const [year, month] = iso.split('-')
  const d = new Date(Number(year), Number(month) - 1, 1)
  return d.toLocaleDateString('fr-SN', { month: 'short' })
}

function formatK(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`
  if (n >= 1_000) return `${Math.round(n / 1_000)} k`
  return String(n)
}

export default function RevenueChart({ data }: { data: MonthData[] }) {
  const max = useMemo(() => Math.max(...data.map(d => d.revenue), 1), [data])
  const totalWidth = data.length * (BAR_WIDTH + GAP) - GAP

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Aucune donnée disponible
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <svg
        width={totalWidth}
        height={CHART_HEIGHT + 40}
        className="min-w-full"
        style={{ minWidth: totalWidth }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = CHART_HEIGHT - frac * CHART_HEIGHT
          return (
            <g key={frac}>
              <line
                x1={0} y1={y} x2={totalWidth} y2={y}
                stroke="#f0f0f0" strokeWidth={1}
              />
              <text
                x={-4} y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill="#9ca3af"
              >
                {formatK(frac * max)}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = Math.max(2, (d.revenue / max) * CHART_HEIGHT)
          const x = i * (BAR_WIDTH + GAP)
          const y = CHART_HEIGHT - barH
          const isLast = i === data.length - 1

          return (
            <g key={d.month}>
              {/* Bar */}
              <rect
                x={x} y={y}
                width={BAR_WIDTH} height={barH}
                rx={6} ry={6}
                fill={isLast ? 'var(--color-primary, #6366f1)' : '#e0e7ff'}
                className="transition-all duration-300"
              />
              {/* Value label on top */}
              {d.revenue > 0 && (
                <text
                  x={x + BAR_WIDTH / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize={9}
                  fill={isLast ? 'var(--color-primary, #6366f1)' : '#6b7280'}
                  fontWeight={isLast ? 700 : 400}
                >
                  {formatK(d.revenue)}
                </text>
              )}
              {/* Month label below */}
              <text
                x={x + BAR_WIDTH / 2}
                y={CHART_HEIGHT + 18}
                textAnchor="middle"
                fontSize={10}
                fill={isLast ? 'var(--color-primary, #6366f1)' : '#9ca3af'}
                fontWeight={isLast ? 700 : 400}
              >
                {shortMonth(d.month)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
