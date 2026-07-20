"use client"

import { useState, useCallback } from "react"
import { Plus, Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppLayout } from "@/components/layout/AppLayout"
import { BuyersKpiCards } from "./buyers-kpi-cards"
import { BuyersTable } from "./buyers-table"
import { getBuyerColumns } from "./buyers-columns"
import { BuyerFormDialog } from "./buyer-form-dialog"
import { BuyerDeleteDialog } from "./buyer-delete-dialog"
import { BuyerDetailDialog } from "./buyer-detail-dialog"
import type { Buyer } from "../types"
import { toast } from "sonner"

interface BuyersPageClientProps {
  initialBuyers: Buyer[]
}

export function BuyersPageClient({ initialBuyers }: BuyersPageClientProps) {
  const [buyers, setBuyers] = useState(initialBuyers)
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null)

  const filtered = buyers.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.country.toLowerCase().includes(search.toLowerCase()),
  )

  const handleEdit = useCallback((buyer: Buyer) => {
    setSelectedBuyer(buyer)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((buyer: Buyer) => {
    setSelectedBuyer(buyer)
    setDeleteOpen(true)
  }, [])

  const handleRowClick = useCallback((buyer: Buyer) => {
    setSelectedBuyer(buyer)
    setDetailOpen(true)
  }, [])

  const handleAddNew = useCallback(() => {
    setSelectedBuyer(null)
    setFormOpen(true)
  }, [])

  const handleSaved = useCallback((saved: Buyer) => {
    setBuyers((prev) => {
      const idx = prev.findIndex((b) => b.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
  }, [])

  const handleDeleted = useCallback((id: number) => {
    setBuyers((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const columns = getBuyerColumns({ onEdit: handleEdit, onDelete: handleDelete })

  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Buyers</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage buyer profiles and relationships.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button size="sm" className="gap-2" onClick={handleAddNew}>
                <Plus className="h-4 w-4" />
                Add Buyer
              </Button>
            </div>
          </div>
        </div>

        <BuyersKpiCards buyers={buyers} />

        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-3 p-5 border-b">
            <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder="Search by name, code, or country..."
        className="pl-9"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
            </div>
          </div>
          <div className="p-5">
            <BuyersTable
              columns={columns}
              data={filtered}
              actions={{ onEdit: handleEdit, onDelete: handleDelete }}
              onRowClick={handleRowClick}
            />
          </div>
        </div>
      </div>

      <BuyerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        buyer={selectedBuyer}
        onSaved={handleSaved}
      />

      <BuyerDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        buyer={selectedBuyer}
        onDeleted={handleDeleted}
      />

      <BuyerDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        buyer={selectedBuyer}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </AppLayout>
  )
}
