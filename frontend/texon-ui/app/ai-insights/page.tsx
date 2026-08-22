"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Activity } from "lucide-react"
import { toast } from "sonner"
import { getAiConversations } from "@/lib/api/ai"

type ConversationRow = Record<string, unknown>

export default function AiInsights() {
  const [conversations, setConversations] = React.useState<ConversationRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    getAiConversations()
      .then((res) => {
        const items = Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []
        setConversations(items as ConversationRow[])
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">AI Insights & Optimization</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Machine learning analysis and predictive recommendations across all operations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-accent" onClick={() => toast.info("Deep analysis running...")}>
              <Activity className="h-4 w-4" /> Run Deep Analysis
            </Button>
          </div>
        </div>

        {/* Conversations */}
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> AI Conversation History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && <div className="py-8 text-center text-xs text-muted-foreground">Loading…</div>}
            {!isLoading && conversations.length === 0 && (
              <div className="py-12 px-6 text-center space-y-2">
                <p className="text-sm font-medium text-foreground">No AI insights generated yet.</p>
                <p className="text-xs text-muted-foreground">
                  Start a conversation from the assistant to build up insight history.
                </p>
              </div>
            )}
            {conversations.map((c, i) => (
              <div key={String(c.id ?? i)} className="px-6 py-4 border-b border-border last:border-0 hover:bg-muted/10 transition-colors text-sm">
                <div className="font-medium text-foreground">{String(c.title ?? c.conversation_title ?? `Conversation ${i + 1}`)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{String(c.created_at ?? "")}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
