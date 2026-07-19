"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { buyerFormSchema, type BuyerFormValues } from "../schema"
import type { Buyer } from "../types"
import { submitBuyer } from "../actions"
import { toast } from "sonner"

interface BuyerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  buyer: Buyer | null
  onSaved: () => void
}

export function BuyerFormDialog({
  open,
  onOpenChange,
  buyer,
  onSaved,
}: BuyerFormDialogProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<BuyerFormValues>({
    resolver: zodResolver(buyerFormSchema),
    defaultValues: {
      name: buyer?.name ?? "",
      code: buyer?.code ?? "",
      country: buyer?.country ?? "",
    },
    values: buyer
      ? { name: buyer.name, code: buyer.code, country: buyer.country }
      : undefined,
  })

  function onSubmit(values: BuyerFormValues) {
    startTransition(async () => {
      const result = await submitBuyer(buyer?.id ?? null, values)

      if (result.success) {
        toast.success(buyer ? "Buyer updated" : "Buyer created")
        onOpenChange(false)
        form.reset()
        onSaved()
      } else {
        toast.error(result.error ?? "Something went wrong")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {buyer ? "Edit Buyer" : "Add New Buyer"}
          </DialogTitle>
          <DialogDescription>
            {buyer
              ? "Update the buyer details below."
              : "Fill in the details to add a new buyer."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buyer Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. H&M Group"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buyer Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. HM-GRP"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Sweden"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {buyer ? "Save Changes" : "Create Buyer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
