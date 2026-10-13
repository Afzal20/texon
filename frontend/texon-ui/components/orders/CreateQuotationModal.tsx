'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Layers,
  FileCheck,
} from 'lucide-react'
import { submitCommand, type OperationRecord } from '@/lib/api/operations'
import { useOperationStatus } from '@/hooks/use-operation-status'
import { toast } from 'sonner'

interface CreateQuotationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (saleOrder: Record<string, unknown>) => void
}

export interface SaleOrderReceipt {
  id?: number
  name?: string
  state?: string
  partner_id?: number
  partner_name?: string
  amount_total?: string | number
  currency?: string
  revision?: string
  client_order_ref?: string
}

const DEFAULT_COLORS = ['Optical White', 'Dark Navy', 'Heather Grey', 'Washed Black']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL']

export function CreateQuotationModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateQuotationModalProps) {
  const [partnerId, setPartnerId] = React.useState<number>(1)
  const [clientOrderRef, setClientOrderRef] = React.useState<string>(
    `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  )
  const [unitPrice, setUnitPrice] = React.useState<string>('24.50')
  const [matrix, setMatrix] = React.useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {}
    DEFAULT_COLORS.forEach((color) => {
      initial[color] = { XS: 10, S: 25, M: 50, L: 50, XL: 25, '2XL': 10 }
    })
    return initial
  })

  const [activeOperationUuid, setActiveOperationUuid] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [confirmedState, setConfirmedState] = React.useState<string | null>(null)

  const {
    operation,
    status,
    isPolling,
    isTerminal,
    replay,
  } = useOperationStatus<SaleOrderReceipt>(activeOperationUuid, {
    pollIntervalMs: 800,
    onSucceeded: (record) => {
      toast.success('Quotation created in Odoo 20!')
      if (record.response_data && onSuccess) {
        onSuccess(record.response_data as Record<string, unknown>)
      }
    },
    onRejected: (record) => {
      toast.error(`Odoo rejected quotation: ${record.error_message || 'Validation failed'}`)
    },
  })

  // Calculate live totals
  const totalQuantity = React.useMemo(() => {
    let sum = 0
    Object.values(matrix).forEach((sizes) => {
      Object.values(sizes).forEach((qty) => {
        sum += qty || 0
      })
    })
    return sum
  }, [matrix])

  const parsedPrice = parseFloat(unitPrice) || 0
  const totalValue = (totalQuantity * parsedPrice).toFixed(2)

  const handleQtyChange = (color: string, size: string, value: string) => {
    const num = Math.max(0, parseInt(value, 10) || 0)
    setMatrix((prev) => ({
      ...prev,
      [color]: {
        ...prev[color],
        [size]: num,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (totalQuantity <= 0) {
      toast.error('Please enter at least one item quantity in the matrix.')
      return
    }

    setIsSubmitting(true)
    try {
      const record = await submitCommand(
        'sales.create',
        {
          partner_id: partnerId,
          client_order_ref: clientOrderRef,
          lines: [
            {
              product_id: 308, // Sample garment product template
              quantity: String(totalQuantity),
              unit_price: String(parsedPrice),
            },
          ],
        },
        clientOrderRef
      )

      setActiveOperationUuid(record.operation_uuid)
      toast.info('Command enqueued in Outbox; routing to Odoo...')
    } catch (err) {
      toast.error(`Submission failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmOrder = async () => {
    if (!operation?.response_data) return
    const orderData = operation.response_data as { id: number; revision: string }

    try {
      setIsSubmitting(true)
      const confirmRecord = await submitCommand(
        'sales.confirm',
        {
          order_id: orderData.id,
          expected_revision: orderData.revision,
        },
        clientOrderRef
      )
      setActiveOperationUuid(confirmRecord.operation_uuid)
      setConfirmedState('Confirming in Odoo...')
    } catch (err) {
      toast.error(`Confirmation failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setActiveOperationUuid(null)
    setConfirmedState(null)
    setClientOrderRef(`PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-[780px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                New Garment Quotation (Odoo 20 Bridge)
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Authoritative size/color matrix order synced directly with Odoo transactional core.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {activeOperationUuid && operation ? (
          /* Operation Progress & Receipt View */
          <div className="my-6 space-y-6">
            <div className="rounded-xl border border-border/60 bg-slate-50/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Outbox Operation Lifecycle
                </span>
                <Badge
                  className={
                    operation.status === 'SUCCEEDED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : operation.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : 'bg-indigo-100 text-indigo-800 border-indigo-200 animate-pulse'
                  }
                >
                  {operation.status}
                </Badge>
              </div>

              {/* Progress Stepper */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div
                  className={`p-3 rounded-lg border transition-all ${
                    operation.status !== 'REJECTED'
                      ? 'border-indigo-300 bg-indigo-50/70 text-indigo-900 font-semibold'
                      : 'border-border bg-white text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Clock className="h-4 w-4 text-indigo-600" />
                    <span>1. Enqueued</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate block font-mono">
                    {operation.operation_uuid.slice(0, 8)}...
                  </span>
                </div>

                <div
                  className={`p-3 rounded-lg border transition-all ${
                    operation.status === 'CLAIMED' || operation.status === 'SUCCEEDED'
                      ? 'border-indigo-300 bg-indigo-50/70 text-indigo-900 font-semibold'
                      : 'border-border bg-white text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    <span>2. Leased Worker</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    {operation.attempt_count > 0 ? `Attempt #${operation.attempt_count}` : 'Claimed'}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-lg border transition-all ${
                    operation.status === 'SUCCEEDED'
                      ? 'border-emerald-300 bg-emerald-50/80 text-emerald-900 font-bold'
                      : operation.status === 'REJECTED'
                      ? 'border-rose-300 bg-rose-50 text-rose-800 font-bold'
                      : 'border-border bg-white text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    {operation.status === 'SUCCEEDED' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <FileCheck className="h-4 w-4" />
                    )}
                    <span>3. Odoo Receipt</span>
                  </div>
                  <span className="text-[10px] block">
                    {operation.status === 'SUCCEEDED'
                      ? 'Confirmed in DB'
                      : operation.status === 'REJECTED'
                      ? 'Rejected'
                      : 'Processing...'}
                  </span>
                </div>
              </div>

              {/* Success Result Card */}
              {operation.status === 'SUCCEEDED' && Boolean(operation.response_data) && (
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900">
                        Odoo Sale Order Created: {operation.response_data?.name || 'SO-Confirmed'}
                      </h4>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Client Ref: {operation.response_data?.client_order_ref || clientOrderRef} • Total: $
                        {operation.response_data?.amount_total} USD
                      </p>
                    </div>
                    <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-100">
                      State: {operation.response_data?.state || 'draft'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60">
                    <span className="text-xs text-muted-foreground font-mono">
                      Revision: {operation.response_data?.revision?.slice(0, 19)}
                    </span>
                    {operation.response_data?.state === 'draft' && (
                      <Button
                        size="sm"
                        onClick={handleConfirmOrder}
                        disabled={isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs font-semibold"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Confirm Quotation in Odoo
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Display */}
              {operation.status === 'REJECTED' && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>Business Policy Rejection</span>
                  </div>
                  <p className="pl-6 text-rose-700">{operation.error_message}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetForm}
                className="text-xs"
              >
                Create Another Quotation
              </Button>
              <Button
                size="sm"
                onClick={() => onOpenChange(false)}
                className="bg-slate-900 text-white hover:bg-slate-800 text-xs"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* Form Matrix Input */
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="buyer-select" className="text-xs font-semibold">
                  Buyer Account
                </Label>
                <select
                  id="buyer-select"
                  value={partnerId}
                  onChange={(e) => setPartnerId(parseInt(e.target.value, 10))}
                  className="w-full h-9 rounded-lg border border-border bg-white px-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value={1}>My Company (Internal Sample)</option>
                  <option value={3}>Administrator (Buyer House)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="po-ref" className="text-xs font-semibold">
                  Client PO Reference
                </Label>
                <Input
                  id="po-ref"
                  value={clientOrderRef}
                  onChange={(e) => setClientOrderRef(e.target.value)}
                  placeholder="PO-2026-XXXX"
                  required
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit-price" className="text-xs font-semibold">
                  Unit Price (USD / Piece)
                </Label>
                <Input
                  id="unit-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  required
                  className="h-9 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Matrix Entry Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Garment Color &amp; Size Breakdown Matrix
                </Label>
                <div className="flex items-center gap-3 text-xs">
                  <span>
                    Total Units: <strong className="text-foreground">{totalQuantity} pcs</strong>
                  </span>
                  <span>
                    Est. Value: <strong className="text-indigo-600 font-bold">${totalValue}</strong>
                  </span>
                </div>
              </div>

              <div className="border border-border/80 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-border">
                      <tr>
                        <th className="px-4 py-2.5">Shade / Colorway</th>
                        {SIZES.map((size) => (
                          <th key={size} className="px-3 py-2.5 text-center">
                            {size}
                          </th>
                        ))}
                        <th className="px-4 py-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {DEFAULT_COLORS.map((color) => {
                        const rowTotal = Object.values(matrix[color] || {}).reduce(
                          (a, b) => a + (b || 0),
                          0
                        )
                        return (
                          <tr key={color} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-2 font-medium text-slate-900 whitespace-nowrap">
                              {color}
                            </td>
                            {SIZES.map((size) => (
                              <td key={size} className="px-1.5 py-1.5 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={matrix[color]?.[size] ?? 0}
                                  onChange={(e) => handleQtyChange(color, size, e.target.value)}
                                  className="w-14 h-7 text-center rounded-md border border-border bg-white text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                              </td>
                            ))}
                            <td className="px-4 py-2 text-right font-bold text-slate-700">
                              {rowTotal} pcs
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2 border-t border-border/60">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Odoo 20 Bridge Active (Port 8069)</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || totalQuantity <= 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-semibold text-xs shadow-md shadow-indigo-600/20"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  Dispatch Order ({totalQuantity} pcs • ${totalValue})
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
