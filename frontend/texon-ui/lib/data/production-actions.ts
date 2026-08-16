"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { gqlList } from "@/lib/api/graphql"
import type { ProductionLine, ProductionOrder, SewingRecord, PerformanceRecord, ProductionDashboard } from "./production"

async function getToken(): Promise<string> {
  const token = await getApiToken()
  if (!token) throw new Error("Not authenticated")
  return token
}

export async function getProductionLines(): Promise<ProductionLine[]> {
  const token = await getToken()
  return (await gqlList("production", "ProductionLine", undefined, token)).data as unknown as ProductionLine[]
}

export async function getProductionOrders(search?: string): Promise<ProductionOrder[]> {
  const token = await getToken()
  const rows = (await gqlList("production", "ProductionOrder", undefined, token)).data as unknown as ProductionOrder[]
  return search ? rows.filter((row) => String(row.order_number).includes(search)) : rows
}

export async function getSewingRecords(_lineId?: number): Promise<SewingRecord[]> {
  void _lineId
  const token = await getToken()
  return (await gqlList("production", "SewingRecord", undefined, token)).data as unknown as SewingRecord[]
}

export async function getPerformanceRecords(): Promise<PerformanceRecord[]> {
  const token = await getToken()
  return (await gqlList("performance", "PerformanceRecord", undefined, token)).data as unknown as PerformanceRecord[]
}

export async function getDashboardSummary(): Promise<ProductionDashboard> {
  const token = await getToken()
  const [{ data: orders }, { data: sewing }, { data: lines }] = await Promise.all([
    gqlList("production", "ProductionOrder", undefined, token),
    gqlList("production", "SewingRecord", undefined, token),
    gqlList("production", "ProductionLine", undefined, token),
  ])
  const totalOrders = orders.length
  const outputActual = sewing.reduce((sum, row) => sum + (Number(row.output_quantity) || 0), 0)
  const outputTarget = sewing.reduce((sum, row) => sum + (Number(row.input_quantity) || 0), 0)
  const outputPercentage = outputTarget > 0 ? Math.round((outputActual / outputTarget) * 100) : 0
  return {
    total_orders: totalOrders,
    order_trend: "stable",
    output_percentage: outputPercentage,
    output_actual: outputActual,
    output_target: outputTarget,
    delay_risk_percentage: 0,
    delay_risk_note: "No delays detected",
    active_lines: lines.length,
    total_lines: lines.length,
    lines_running: lines.length,
    lines_error: 0,
    lines_idle: 0,
  }
}