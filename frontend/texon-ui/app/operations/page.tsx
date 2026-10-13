'use client'

import * as React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Search,
  RefreshCw,
  Plus,
  Layers,
  Server,
  Database,
  ArrowUpRight,
  ShieldCheck,
  ShoppingBag,
  Package,
  Factory,
  Users,
  FileCheck2,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  fetchOperationsList,
  fetchOdooWorkspace,
  replayOperation,
  submitCommand,
  type OperationRecord,
  type OdooWorkspaceResponse,
} from '@/lib/api/operations'
import { CreateQuotationModal } from '@/components/orders/CreateQuotationModal'

export default function OperationsCommandHub() {
  const [operations, setOperations] = React.useState<OperationRecord[]>([])
  const [loadingOps, setLoadingOps] = React.useState<boolean>(false)
  const [activeTab, setActiveTab] = React.useState<string>('explorer')
  const [workspaceSection, setWorkspaceSection] = React.useState<string>('sales')
  const [workspaceData, setWorkspaceData] = React.useState<OdooWorkspaceResponse | null>(null)
  const [loadingWorkspace, setLoadingWorkspace] = React.useState<boolean>(false)
  const [searchFilter, setSearchFilter] = React.useState<string>('')
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false)
  const [replayingUuid, setReplayingUuid] = React.useState<string | null>(null)
  const [selectedOp, setSelectedOp] = React.useState<OperationRecord | null>(null)

  // Fetch recent outbox operations
  const loadOperations = React.useCallback(async () => {
    setLoadingOps(true)
    try {
      const list = await fetchOperationsList(30)
      setOperations(list)
    } catch (err) {
      toast.error('Failed to load recent operations queue')
    } finally {
      setLoadingOps(false)
    }
  }, [])

  // Fetch live authoritative Odoo workspace data
  const loadWorkspace = React.useCallback(async (section: string) => {
    setLoadingWorkspace(true)
    try {
      const data = await fetchOdooWorkspace(section, 25, 0)
      setWorkspaceData(data)
    } catch (err) {
      toast.error(`Failed to fetch Odoo ${section} data`)
    } finally {
      setLoadingWorkspace(false)
    }
  }, [])

  React.useEffect(() => {
    void loadOperations()
  }, [loadOperations])

  React.useEffect(() => {
    void loadWorkspace(workspaceSection)
  }, [workspaceSection, loadWorkspace])

  const handleReplay = async (opUuid: string) => {
    setReplayingUuid(opUuid)
    try {
      const updated = await replayOperation(opUuid)
      toast.success(`Operation ${opUuid.slice(0, 8)} replayed: ${updated.status}`)
      void loadOperations()
      void loadWorkspace(workspaceSection)
    } catch (err) {
      toast.error(`Replay failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setReplayingUuid(null)
    }
  }

  const handleConfirmQuotation = async (orderId: number, revision: string) => {
    try {
      toast.info('Dispatching sales.confirm command to Odoo...')
      const record = await submitCommand('sales.confirm', {
        order_id: orderId,
        expected_revision: revision,
      })
      toast.success('Confirmation queued in Outbox!')
      void loadOperations()
      setTimeout(() => void loadWorkspace('sales'), 1500)
    } catch (err) {
      toast.error(`Confirmation failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // Filter workspace records
  const filteredRecords = React.useMemo(() => {
    if (!workspaceData?.results) return []
    if (!searchFilter.trim()) return workspaceData.results

    const q = searchFilter.toLowerCase()
    return workspaceData.results.filter((item: any) => {
      const name = String(item.name || item.client_order_ref || item.product_id?.[1] || '').toLowerCase()
      const partner = String(item.partner_name || '').toLowerCase()
      return name.includes(q) || partner.includes(q)
    })
  }, [workspaceData, searchFilter])

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Header with Live Infrastructure Pulse */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                Odoo 20.0 Community Edition
              </Badge>
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live JSON-RPC Active
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Odoo ERP Integration Hub
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Transactional Outbox engine, atomic receipts, and live apparel synchronization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void loadOperations()
                void loadWorkspace(workspaceSection)
                toast.success('Refreshed live Odoo & Outbox status')
              }}
              className="gap-2 h-9 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingOps || loadingWorkspace ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-semibold h-9 text-xs shadow-md shadow-indigo-600/20"
            >
              <Plus className="h-4 w-4" />
              New Garment Quotation
            </Button>
          </div>
        </div>

        {/* 4 Health & Metric Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-border/70 shadow-sm bg-white/70 backdrop-blur-md hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Odoo 20 Server
              </CardTitle>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Server className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">Online (8069)</div>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                texon_bridge v20.0.1.0.0
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-sm bg-white/70 backdrop-blur-md hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Transactional Outbox
              </CardTitle>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Layers className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-indigo-600">
                {operations.filter((o) => o.status === 'SUCCEEDED').length} Succeeded
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                {operations.filter((o) => o.status === 'PENDING' || o.status === 'CLAIMED').length} in active lease
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-sm bg-white/70 backdrop-blur-md hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Authoritative DB
              </CardTitle>
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                <Database className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">PostgreSQL 16</div>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Advisory xact locks active
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-sm bg-white/70 backdrop-blur-md hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                ERP Boundary
              </CardTitle>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">13 Pillars</div>
              <p className="text-xs text-amber-700 font-medium mt-1">
                Single authoritative ledger
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="explorer" className="rounded-lg text-xs font-semibold">
              Authoritative Odoo Explorer
            </TabsTrigger>
            <TabsTrigger value="outbox" className="rounded-lg text-xs font-semibold">
              Live Outbox &amp; Receipts ({operations.length})
            </TabsTrigger>
            <TabsTrigger value="architecture" className="rounded-lg text-xs font-semibold">
              Integration Architecture
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Authoritative Odoo Workspace Explorer */}
          <TabsContent value="explorer" className="space-y-4">
            <Card className="rounded-2xl border border-border/70 shadow-sm overflow-hidden bg-white">
              <CardHeader className="border-b border-border/60 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Authoritative Records in Odoo 20
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Live data queried directly via <code className="text-indigo-600">texon.bridge.service.read_workspace</code>.
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-48 sm:w-64">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search records..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="pl-8 h-8 text-xs rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-navigation for Odoo Domain */}
                <div className="flex flex-wrap items-center gap-1.5 pt-3">
                  {[
                    { id: 'sales', label: 'Sales Orders', icon: ShoppingBag },
                    { id: 'products', label: 'Products & Apparel', icon: Package },
                    { id: 'partners', label: 'Buyers & Partners', icon: Users },
                    { id: 'inventory', label: 'Stock Quants', icon: Layers },
                    { id: 'production', label: 'Manufacturing (MO)', icon: Factory },
                  ].map((tab) => {
                    const Icon = tab.icon
                    const isSelected = workspaceSection === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setWorkspaceSection(tab.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-border">
                      {workspaceSection === 'sales' && (
                        <tr>
                          <th className="px-5 py-3">Order Ref</th>
                          <th className="px-5 py-3">Buyer Account</th>
                          <th className="px-5 py-3">Client PO</th>
                          <th className="px-5 py-3">Amount Total</th>
                          <th className="px-5 py-3">State</th>
                          <th className="px-5 py-3">Atomic Revision</th>
                          <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                      )}
                      {workspaceSection === 'products' && (
                        <tr>
                          <th className="px-5 py-3">Product Name</th>
                          <th className="px-5 py-3">Default Code</th>
                          <th className="px-5 py-3">Unit of Measure</th>
                          <th className="px-5 py-3">List Price</th>
                        </tr>
                      )}
                      {workspaceSection === 'partners' && (
                        <tr>
                          <th className="px-5 py-3">Partner ID</th>
                          <th className="px-5 py-3">Account Name</th>
                          <th className="px-5 py-3">Role</th>
                        </tr>
                      )}
                      {workspaceSection === 'inventory' && (
                        <tr>
                          <th className="px-5 py-3">Product</th>
                          <th className="px-5 py-3">Stock Location</th>
                          <th className="px-5 py-3">On Hand Qty</th>
                          <th className="px-5 py-3">Reserved Qty</th>
                        </tr>
                      )}
                      {workspaceSection === 'production' && (
                        <tr>
                          <th className="px-5 py-3">MO Reference</th>
                          <th className="px-5 py-3">Product</th>
                          <th className="px-5 py-3">Quantity</th>
                          <th className="px-5 py-3">State</th>
                        </tr>
                      )}
                    </thead>

                    <tbody className="divide-y divide-border/60">
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground text-xs">
                            {loadingWorkspace
                              ? 'Loading authoritative data from Odoo...'
                              : 'No records found in this domain.'}
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((item: any, idx: number) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors">
                            {workspaceSection === 'sales' && (
                              <>
                                <td className="px-5 py-3 font-bold text-foreground">
                                  {item.name}
                                </td>
                                <td className="px-5 py-3 text-slate-700">
                                  {item.partner_name || `Partner #${item.partner_id}`}
                                </td>
                                <td className="px-5 py-3 font-mono text-[11px] text-slate-600">
                                  {item.client_order_ref || '—'}
                                </td>
                                <td className="px-5 py-3 font-bold text-indigo-700">
                                  ${item.amount_total} {item.currency}
                                </td>
                                <td className="px-5 py-3">
                                  <Badge
                                    className={
                                      item.state === 'sale'
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                        : 'bg-amber-100 text-amber-800 border-amber-200'
                                    }
                                  >
                                    {item.state}
                                  </Badge>
                                </td>
                                <td className="px-5 py-3 font-mono text-[10px] text-muted-foreground truncate max-w-[140px]">
                                  {item.revision}
                                </td>
                                <td className="px-5 py-3 text-right">
                                  {item.state === 'draft' ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleConfirmQuotation(item.id, item.revision)}
                                      className="h-7 text-[11px] gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                    >
                                      <Sparkles className="h-3 w-3" /> Confirm
                                    </Button>
                                  ) : (
                                    <span className="text-[11px] text-emerald-700 font-semibold">Confirmed</span>
                                  )}
                                </td>
                              </>
                            )}

                            {workspaceSection === 'products' && (
                              <>
                                <td className="px-5 py-3 font-bold text-foreground">{item.name}</td>
                                <td className="px-5 py-3 font-mono text-muted-foreground">{item.default_code || '—'}</td>
                                <td className="px-5 py-3">{item.uom_id?.[1] || 'Units'}</td>
                                <td className="px-5 py-3 font-bold text-slate-800">${item.list_price}</td>
                              </>
                            )}

                            {workspaceSection === 'partners' && (
                              <>
                                <td className="px-5 py-3 font-mono text-muted-foreground">#{item.id}</td>
                                <td className="px-5 py-3 font-bold text-foreground">{item.name}</td>
                                <td className="px-5 py-3">
                                  <Badge variant="outline" className="text-xs">
                                    Customer / Buyer
                                  </Badge>
                                </td>
                              </>
                            )}

                            {workspaceSection === 'inventory' && (
                              <>
                                <td className="px-5 py-3 font-bold text-foreground">{item.product_id?.[1]}</td>
                                <td className="px-5 py-3 text-muted-foreground">{item.location_id?.[1]}</td>
                                <td className="px-5 py-3 font-bold text-emerald-700">{item.quantity}</td>
                                <td className="px-5 py-3 font-mono text-amber-700">{item.reserved_quantity}</td>
                              </>
                            )}

                            {workspaceSection === 'production' && (
                              <>
                                <td className="px-5 py-3 font-bold text-foreground">{item.name}</td>
                                <td className="px-5 py-3">{item.product_id?.[1]}</td>
                                <td className="px-5 py-3 font-bold text-indigo-700">{item.product_qty}</td>
                                <td className="px-5 py-3">
                                  <Badge>{item.state}</Badge>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Live Outbox & Receipts Activity Log */}
          <TabsContent value="outbox" className="space-y-4">
            <Card className="rounded-2xl border border-border/70 shadow-sm overflow-hidden bg-white">
              <CardHeader className="border-b border-border/60 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Transactional Outbox Activity Log
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Persistent command records with SHA-256 fingerprints, lease tokens, and crash reclamation.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadOperations}
                  className="gap-1.5 h-8 text-xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingOps ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-border">
                      <tr>
                        <th className="px-5 py-3">Operation UUID</th>
                        <th className="px-5 py-3">Command</th>
                        <th className="px-5 py-3">Aggregate ID</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Attempts</th>
                        <th className="px-5 py-3">Created</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {operations.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground text-xs">
                            No outbox operations found.
                          </td>
                        </tr>
                      ) : (
                        operations.map((op) => (
                          <tr key={op.operation_uuid} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3 font-mono font-bold text-foreground">
                              {op.operation_uuid.slice(0, 8)}...{op.operation_uuid.slice(-4)}
                            </td>
                            <td className="px-5 py-3">
                              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                                {op.command_name}
                              </span>
                            </td>
                            <td className="px-5 py-3 font-medium text-slate-700">
                              {op.aggregate_id}
                            </td>
                            <td className="px-5 py-3">
                              <Badge
                                className={
                                  op.status === 'SUCCEEDED'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : op.status === 'REJECTED'
                                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                                    : op.status === 'OUTCOME_UNKNOWN'
                                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                                    : 'bg-indigo-100 text-indigo-800 border-indigo-200 animate-pulse'
                                }
                              >
                                {op.status}
                              </Badge>
                            </td>
                            <td className="px-5 py-3 font-mono text-muted-foreground">
                              {op.attempt_count} / {op.max_attempts}
                            </td>
                            <td className="px-5 py-3 text-muted-foreground text-[11px]">
                              {new Date(op.created_at).toLocaleTimeString()}
                            </td>
                            <td className="px-5 py-3 text-right space-x-1">
                              {(op.status === 'OUTCOME_UNKNOWN' || op.status === 'DEAD_LETTER') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={replayingUuid === op.operation_uuid}
                                  onClick={() => handleReplay(op.operation_uuid)}
                                  className="h-7 text-[11px] gap-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                                >
                                  <RotateCcw className="h-3 w-3" /> Replay
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedOp(op)}
                                className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                              >
                                Details
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Selected Operation Detail Modal / Drawer */}
            {selectedOp && (
              <Card className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                    <h4 className="text-sm font-bold text-indigo-950">
                      Operation Receipt: {selectedOp.operation_uuid}
                    </h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOp(null)}
                    className="h-7 text-xs"
                  >
                    Close
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-white rounded-xl border border-border space-y-1">
                    <span className="text-muted-foreground font-sans block text-[10px] font-bold uppercase">
                      Execution Metadata
                    </span>
                    <div>Command: <strong>{selectedOp.command_name}</strong></div>
                    <div>Aggregate: {selectedOp.aggregate_id}</div>
                    <div>Status: {selectedOp.status}</div>
                    <div>Company: #{selectedOp.company_id}</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-border space-y-1 overflow-x-auto">
                    <span className="text-muted-foreground font-sans block text-[10px] font-bold uppercase">
                      Response Payload (Atomic Receipt)
                    </span>
                    <pre className="text-[11px] text-slate-800">
                      {JSON.stringify(selectedOp.response_data, null, 2) || selectedOp.error_message || 'None'}
                    </pre>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* TAB 3: Integration Architecture Diagnostic */}
          <TabsContent value="architecture" className="space-y-4">
            <Card className="rounded-2xl border border-border/70 shadow-sm p-6 bg-white space-y-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  The Texon–Odoo 13-Module Architecture
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  How Texon's Next.js tailored apparel interface connects with Odoo 20's authoritative core.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                    <ShoppingBag className="h-4 w-4 text-indigo-600" />
                    <span>Texon Frontend &amp; Django Layer (Apparel Specialty)</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                    <li>Garment Color $\times$ Size matrix ordering interface</li>
                    <li>Evidence-backed AI Assistant with confirmed action proposals</li>
                    <li>Transactional Outbox with SHA-256 canonical fingerprints</li>
                    <li>Fast, disposable read caches and customized buyer dashboards</li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <Server className="h-4 w-4 text-emerald-600" />
                    <span>Odoo 20.0 Community (Authoritative Core)</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                    <li>Authoritative general ledger, financial postings, and tax journals</li>
                    <li>Physical inventory quants, reservations, and stock valuations</li>
                    <li>Manufacturing MRP orders, work centers, and scrap tracking</li>
                    <li>Durable receipts with PostgreSQL advisory transaction locks</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal for creating a new quotation */}
        <CreateQuotationModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSuccess={() => {
            void loadOperations()
            void loadWorkspace('sales')
          }}
        />
      </div>
    </AppLayout>
  )
}
