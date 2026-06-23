"use client"

import { cn } from "@/lib/utils"

const columns = ["8a", "10a", "12p", "2p", "4p"]
const rows = ["L1", "L2", "L3", "L4", "L5"]

const heatmapData = [
  ["bg-gray-200/50", "bg-gray-200/50", "bg-gray-200/50", "bg-blue-100", "bg-gray-200/50"],
  ["bg-gray-200/50", "bg-gray-200/50", "bg-blue-200", "bg-blue-400", "bg-blue-600"],
  ["bg-gray-200/50", "bg-blue-100", "bg-gray-200/50", "bg-gray-200/50", "bg-gray-200/50"],
  ["bg-red-50", "bg-red-100", "bg-gray-200/50", "bg-gray-200/50", "bg-gray-200/50"],
  ["bg-gray-200/50", "bg-gray-200/50", "bg-gray-200/50", "bg-blue-100", "bg-gray-200/50"],
]

export function RiskHeatmap() {
  return (
    <div className="w-full mt-4">
      <div className="grid grid-cols-[auto_1fr] gap-2">
        {/* Y Axis labels */}
        <div className="flex flex-col justify-between py-2 pr-2">
          {rows.map((row) => (
            <div key={row} className="text-xs text-muted-foreground font-medium h-[50px] flex items-center">
              {row}
            </div>
          ))}
        </div>
        
        {/* Heatmap Grid */}
        <div className="flex flex-col gap-1">
          {heatmapData.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-5 gap-1 h-[50px]">
              {row.map((colorClass, colIndex) => (
                <div 
                  key={colIndex} 
                  className={cn("w-full h-full rounded-sm transition-colors hover:opacity-80 cursor-pointer", colorClass)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* X Axis labels */}
      <div className="grid grid-cols-[auto_1fr] gap-2 mt-2">
        <div className="w-6" /> {/* Spacer matching Y axis width */}
        <div className="grid grid-cols-5 gap-1">
          {columns.map((col) => (
            <div key={col} className="text-center text-xs text-muted-foreground font-medium">
              {col}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
