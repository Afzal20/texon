import { getSession } from "@/auth/lib/session"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { InfoIcon } from "lucide-react"

async function UserDetails() {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  return (
    <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
      {JSON.stringify({ userId: session.userId, email: session.email, role: session.role }, null, 2)}
    </pre>
  )
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <Suspense fallback={<pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">Loading...</pre>}>
          <UserDetails />
        </Suspense>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">You are authenticated</h2>
        <p className="text-sm text-muted-foreground">
          Your session is active and secure.
        </p>
      </div>
    </div>
  )
}
