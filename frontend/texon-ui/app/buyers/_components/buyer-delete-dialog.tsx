"use client"

import { useTransition } from "react"
import { Loader2, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteBuyer } from "../actions"
import type { Buyer } from "../types"
import { toast } from "sonner"

interface BuyerDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  buyer: Buyer | null
  onDeleted: (id: number) => void
}

export function BuyerDeleteDialog({
  open,
  onOpenChange,
  buyer,
  onDeleted,
}: BuyerDeleteDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!buyer) return

    startTransition(async () => {
      const result = await deleteBuyer(buyer.id)
        .then(() => ({ success: true as const }))
        .catch((err: Error) => ({
          success: false as const,
          error: err.message,
        }))

      if (result.success) {
        toast.success("Buyer deleted")
        onOpenChange(false)
        onDeleted(buyer.id)
      } else {
        toast.error(result.error ?? "Failed to delete buyer")
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Buyer
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {buyer?.name}
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
