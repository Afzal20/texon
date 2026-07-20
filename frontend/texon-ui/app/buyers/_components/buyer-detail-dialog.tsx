"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Building2, Globe, Mail, Phone, User, MapPin, Calendar } from "lucide-react"
import type { Buyer } from "../types"

interface BuyerDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  buyer: Buyer | null
  onEdit: (buyer: Buyer) => void
  onDelete: (buyer: Buyer) => void
}

export function BuyerDetailDialog({ open, onOpenChange, buyer, onEdit, onDelete }: BuyerDetailDialogProps) {
  if (!buyer) return null

  const fields = [
    { icon: Building2, label: "Company", value: buyer.name },
    { icon: Globe, label: "Country", value: buyer.country },
    { icon: User, label: "Contact", value: buyer.contact_person || "-" },
    { icon: Mail, label: "Email", value: buyer.email || "-" },
    { icon: Phone, label: "Phone", value: buyer.phone || "-" },
    { icon: MapPin, label: "Address", value: buyer.address || "-" },
    { icon: Calendar, label: "Created", value: new Date(buyer.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{buyer.name}</DialogTitle>
              <DialogDescription>
                Code: <span className="font-mono font-medium text-foreground">{buyer.code}</span>
              </DialogDescription>
            </div>
            <Badge variant={buyer.is_active ? "default" : "secondary"}>
              {buyer.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.label} className="flex items-start gap-3 text-sm">
              <f.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{f.label}</p>
                <p className="font-medium truncate">{f.value}</p>
              </div>
            </div>
          ))}

          {buyer.rating && (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              <span className="text-xs text-muted-foreground">Rating</span>
              <span className="font-semibold">{Number(buyer.rating.rating).toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({buyer.rating.reviews_count} reviews)</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" size="sm" className="gap-2 text-destructive" onClick={() => { onOpenChange(false); onDelete(buyer) }}>
            <Trash2 className="size-3.5" /> Delete
          </Button>
          <Button size="sm" className="gap-2" onClick={() => { onOpenChange(false); onEdit(buyer) }}>
            <Pencil className="size-3.5" /> Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
