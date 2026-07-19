import { Suspense } from "react"
import { BuyersPageClient } from "./_components/buyers-page-client"
import { getBuyers } from "./actions"
import { Skeleton } from "@/components/ui/skeleton"

async function BuyersData() {
  let buyers: Awaited<ReturnType<typeof getBuyers>>["results"] = []

  try {
    const response = await getBuyers()
    buyers = response.results
  } catch {
    buyers = []
  }

  return <BuyersPageClient initialBuyers={buyers} />
}

function BuyersLoading() {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full max-w-sm rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  )
}

export default function BuyersPage() {
  return (
    <Suspense fallback={<BuyersLoading />}>
      <BuyersData />
    </Suspense>
  )
}
