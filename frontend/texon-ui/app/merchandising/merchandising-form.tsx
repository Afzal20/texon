"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

export type FormField = {
  name: string
  label: string
  type?: "text" | "number" | "date" | "textarea" | "select"
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
}

export function MerchandisingForm({
  module,
  title,
  fields,
  onSubmit,
}: {
  module: string
  title: string
  fields: FormField[]
  onSubmit: (data: Record<string, unknown>) => Promise<unknown>
}) {
  const router = useRouter()
  const [formData, setFormData] = React.useState<Record<string, unknown>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)

  const set = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next })
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    for (const f of fields) {
      if (f.required && !formData[f.name]) errs[f.name] = `${f.label} is required`
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSubmit(formData)
      toast.success(`${title} created successfully`)
      router.push(`/merchandising/${module}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: Record<string, string[]> } })?.response?.data
        ? Object.values((err as { response: { data: Record<string, string[]> } }).response.data).flat().join(", ")
        : (err as Error)?.message || "Failed to create"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <main className="mx-auto max-w-[720px] space-y-6 p-6 md:p-8">
        <a href={`/merchandising/${module}`} className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back to {module.replace(/-/g, " ")}
        </a>
        <h1 className="text-2xl font-bold tracking-tight">New {title}</h1>
        <Card>
          <CardHeader className="border-b px-6 py-5">
            <CardTitle className="text-base">{title} details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {f.label}{f.required ? <span className="text-rose-500"> *</span> : null}
                  </label>
                  {f.type === "textarea" ? (
                    <Textarea
                      placeholder={f.placeholder}
                      value={String(formData[f.name] ?? "")}
                      onChange={(e) => set(f.name, e.target.value)}
                    />
                  ) : f.type === "select" ? (
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={String(formData[f.name] ?? "")}
                      onChange={(e) => set(f.name, e.target.value)}
                    >
                      <option value="">Select...</option>
                      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <Input
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      placeholder={f.placeholder}
                      value={String(formData[f.name] ?? "")}
                      onChange={(e) => set(f.name, f.type === "number" ? Number(e.target.value) : e.target.value)}
                    />
                  )}
                  {errors[f.name] && <p className="mt-1 text-xs text-rose-500">{errors[f.name]}</p>}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Create {title}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push(`/merchandising/${module}`)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  )
}
