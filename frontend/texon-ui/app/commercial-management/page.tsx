"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

const pages = [
  { title: "Import management", slug: "import-management" },
  { title: "Export management", slug: "export-management" },
  { title: "Export LC/sales contract collection & amendment", slug: "export-lc-sales-contract-collection-amendment" },
  { title: "BTB LC opening & amendment", slug: "btb-lc-opening-amendment" },
  { title: "Shipment monitoring & ETA updates", slug: "shipment-monitoring-eta-updates" },
  { title: "Supplier document receive & acceptance", slug: "supplier-document-receive-acceptance" },
  { title: "Acceptance clearance", slug: "acceptance-clearance" },
  { title: "Booking to forwarder", slug: "booking-to-forwarder" },
  { title: "Invoice preparation", slug: "invoice-preparation" },
  { title: "Bill of exchange/bank document", slug: "bill-of-exchange-bank-document" },
  { title: "Realization follow-up", slug: "realization-follow-up" },
  { title: "Short realization cause tracking", slug: "short-realization-cause-tracking" },
  { title: "SOD/FC transfer acknowledgement", slug: "sod-fc-transfer-acknowledgement" },
  { title: "Disbursement amount tracking", slug: "disbursement-amount-tracking" }
]

export default function CommercialManagementIndexPage() {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Commercial Management</h2>
            <p className="text-muted-foreground mt-1 text-sm">14 modules</p>
          </div>
          <Badge variant="outline" className="gap-1 text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
            Live — API Connected
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a key="import-management" href="commercial-management/import-management">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Import management
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="export-management" href="commercial-management/export-management">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Export management
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="export-lc-sales-contract-collection-amendment" href="commercial-management/export-lc-sales-contract-collection-amendment">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Export LC/sales contract collection & amendment
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="btb-lc-opening-amendment" href="commercial-management/btb-lc-opening-amendment">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  BTB LC opening & amendment
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="shipment-monitoring-eta-updates" href="commercial-management/shipment-monitoring-eta-updates">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Shipment monitoring & ETA updates
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="supplier-document-receive-acceptance" href="commercial-management/supplier-document-receive-acceptance">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Supplier document receive & acceptance
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="acceptance-clearance" href="commercial-management/acceptance-clearance">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Acceptance clearance
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="booking-to-forwarder" href="commercial-management/booking-to-forwarder">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Booking to forwarder
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="invoice-preparation" href="commercial-management/invoice-preparation">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Invoice preparation
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="bill-of-exchange-bank-document" href="commercial-management/bill-of-exchange-bank-document">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Bill of exchange/bank document
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="realization-follow-up" href="commercial-management/realization-follow-up">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Realization follow-up
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="short-realization-cause-tracking" href="commercial-management/short-realization-cause-tracking">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Short realization cause tracking
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="sod-fc-transfer-acknowledgement" href="commercial-management/sod-fc-transfer-acknowledgement">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  SOD/FC transfer acknowledgement
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
          <a key="disbursement-amount-tracking" href="commercial-management/disbursement-amount-tracking">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  Disbursement amount tracking
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </a>
        </div>
      </div>
    </AppLayout>
  )
}
