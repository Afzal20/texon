"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createFabric, createAccessory, createTrim } from "@/lib/api/inventory"
import { toast } from "sonner"

const types = [
  { value: "fabric", label: "Fabric" },
  { value: "accessory", label: "Accessory" },
  { value: "trim", label: "Trim" },
] as const

const commonFields: { name: string; label: string; type?: string }[] = [
  { name: "name", label: "Name" },
  { name: "code", label: "Code" },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "unit", label: "Unit" },
  { name: "threshold_quantity", label: "Threshold quantity", type: "number" },
  { name: "unit_price", label: "Unit price", type: "number" },
  { name: "is_active", label: "Active" },
]

const fabricOnly: { name: string; label: string; type?: string }[] = [
  { name: "color", label: "Color" },
  { name: "composition", label: "Composition" },
  { name: "width", label: "Width", type: "number" },
]

const accessoryOnly: { name: string; label: string; type?: string }[] = [
  { name: "category", label: "Category" },
]

const createFns: Record<string, (d: Record<string, unknown>) => ReturnType<typeof createFabric>> = {
  fabric: createFabric,
  accessory: createAccessory,
  trim: createTrim,
}

export default function NewRmPage() {
  const router = useRouter()
  const [type, setType] = React.useState("fabric")
  const [formData, setFormData] = React.useState<Record<string, unknown>>({})
  const [submitting, setSubmitting] = React.useState(false)

  const set = (name: string, value: unknown) => setFormData((prev) => ({ ...prev, [name]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createFns[type](formData)
      toast.success("Material created successfully")
      router.push("/merchandising/rm-collection-consumption-sourcing")
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to create")
    } finally {
      setSubmitting(false)
    }
  }

  const extraFields = type === "fabric" ? fabricOnly : type === "accessory" ? accessoryOnly : []
  const allFields = [...commonFields, ...extraFields]

  return (
    <AppLayout>
      <main className="mx-auto max-w-[720px] space-y-6 p-6 md:p-8">
        <a href="/merchandising/rm-collection-consumption-sourcing" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back to materials
        </a>
        <h1 className="text-2xl font-bold tracking-tight">New material</h1>
        <Card>
          <CardHeader className="border-b px-6 py-5">
            <CardTitle className="text-base">Material details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Type</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={type}
                  onChange={(e) => { setType(e.target.value); setFormData({}) }}
                >
                  {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              {allFields.map((f) => (
                <div key={f.name}>
                  <label className="mb-1.5 block text-sm font-medium">{f.label}</label>
                  {f.name === "is_active" ? (
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={String(formData[f.name] ?? "true")}
                      onChange={(e) => set(f.name, e.target.value === "true")}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : "text"}
                      value={String(formData[f.name] ?? "")}
                      onChange={(e) => set(f.name, f.type === "number" ? Number(e.target.value) : e.target.value)}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Create material
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/merchandising/rm-collection-consumption-sourcing")}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  )
}
