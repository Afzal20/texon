"use client"

import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

const data = Array.from({ length: 30 }).map((_, i) => {
  const day = i + 1;
  const base = 12000;
  const variance = Math.floor(Math.random() * 3000) - 1500;
  return {
    date: `Oct ${day.toString().padStart(2, "0")}`,
    production: base + variance,
  };
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border shadow-md rounded-lg px-3 py-2">
        <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-bold text-primary">
          {payload[0].value.toLocaleString()} pcs
        </p>
      </div>
    )
  }
  return null
}

export function TrendChart() {
  return (
    <div className="h-full w-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 200 }}>
        <AreaChart data={data} margin={{ top: 16, right: 16, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            dy={8}
            minTickGap={30}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="production"
            stroke="#4f46e5"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorProduction)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
