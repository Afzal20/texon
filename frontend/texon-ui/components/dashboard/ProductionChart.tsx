"use client"

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine
} from "recharts"

const data = [
  { time: "08a", actual: 180 },
  { time: "10a", actual: 550 },
  { time: "12p", actual: 820 },
  { time: "2p",  actual: 680 },
  { time: "4p",  actual: 1050, predicted: 1050 },
  { time: "6p",  predicted: 600 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border shadow-md rounded-lg px-3 py-2">
        <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="text-sm font-bold" style={{ color: p.stroke }}>
            {p.dataKey === "actual" ? "Actual" : "Predicted"}: {p.value} pcs/hr
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function ProductionChart() {
  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            domain={[0, 1100]}
            ticks={[0, 250, 500, 750, 1000]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={800} stroke="#d1d5db" strokeDasharray="5 5" strokeWidth={1.5} />

          {/* Actual line */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
          />

          {/* Predicted (dashed) */}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#4f46e5"
            strokeWidth={2.5}
            strokeDasharray="5 4"
            dot={false}
            activeDot={{ r: 5, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
