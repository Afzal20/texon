import { Suspense } from "react"
import { fetchAllFromGraphQL } from "./actions"
import DataExplorer from "./_components/data-explorer"
import { Skeleton } from "@/components/ui/skeleton"

async function DataLoader() {
  const data = await fetchAllFromGraphQL()
  return <DataExplorer data={data} />
}

function Loading() {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-96" />
      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default function DataPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DataLoader />
    </Suspense>
  )
}