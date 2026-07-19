import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Globe, Star, TrendingUp } from "lucide-react"
import type { Buyer } from "../types"

interface BuyersKpiCardsProps {
  buyers: Buyer[]
}

export function BuyersKpiCards({ buyers }: BuyersKpiCardsProps) {
  const totalBuyers = buyers.length
  const countries = new Set(buyers.map((b) => b.country)).size
  const ratedBuyers = buyers.filter((b) => b.rating)
  const avgRating =
    ratedBuyers.length > 0
      ? ratedBuyers.reduce((sum, b) => sum + (b.rating?.rating ?? 0), 0) /
        ratedBuyers.length
      : 0
  const topRated = ratedBuyers.filter((b) => (b.rating?.rating ?? 0) >= 4.5).length

  const kpis = [
    {
      title: "Total Buyers",
      value: totalBuyers,
      icon: Users,
      description: "Active in your organization",
    },
    {
      title: "Countries",
      value: countries,
      icon: Globe,
      description: "Unique sourcing regions",
    },
    {
      title: "Avg Rating",
      value: avgRating.toFixed(1),
      icon: Star,
      description: `Across ${ratedBuyers.length} rated buyer(s)`,
    },
    {
      title: "Top Rated",
      value: topRated,
      icon: TrendingUp,
      description: "Buyers rated 4.5 or higher",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
