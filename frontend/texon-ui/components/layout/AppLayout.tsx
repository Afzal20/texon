"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { AppHeader } from "./AppHeader"
import { AiCommandCenter } from "../global/AiCommandCenter"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <React.Suspense fallback={null}>
        <AppSidebar />
      </React.Suspense>
      <SidebarInset className="bg-gradient-to-br from-background to-muted/30 min-h-screen flex flex-col relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <AppHeader />
        <main className="flex-1 overflow-auto animate-in fade-in duration-500 z-10">
          {children}
        </main>
      </SidebarInset>
      <AiCommandCenter />
    </SidebarProvider>
  )
}
