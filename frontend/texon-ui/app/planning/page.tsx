import { Suspense } from "react"
import { WeeklyPlan } from "./weekly-plan"

export default function Page() {
  return (
    <Suspense>
      <WeeklyPlan />
    </Suspense>
  )
}
