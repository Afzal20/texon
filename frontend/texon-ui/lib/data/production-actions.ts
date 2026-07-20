"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { apiFetch } from "@/lib/api"
import type { ProductionLine, ProductionOrder, SewingRecord, PerformanceRecord, ProductionDashboard } from "./production"

async function getToken(): Promise<string> {
  const token = await getApiToken()
  if (!token) throw new Error("Not authenticated")
  return token
}

export async function getProductionLines(): Promise<ProductionLine[]> {
  const token = await getToken()
  return apiFetch("/api/v1/production-lines/", {}, token)
}

export async function getProductionOrders(search?: string): Promise<ProductionOrder[]> {
  const token = await getToken()
  const params = search ? `?search=${search}` : ""
  return apiFetch(`/api/v1/production-orders/${params}`, {}, token)
}

export async function getSewingRecords(lineId?: number): Promise<SewingRecord[]> {
  const token = await getToken()
  const params = lineId ? `?production_line=${lineId}` : ""
  return apiFetch(`/api/v1/sewing-records/${params}`, {}, token)
}

export async function getPerformanceRecords(): Promise<PerformanceRecord[]> {
  const token = await getToken()
  return apiFetch("/api/v1/performance-records/", {}, token)
}

export async function getDashboardSummary(): Promise<ProductionDashboard> {
  const token = await getToken()
  return apiFetch("/api/v1/performance/dashboard-summary/", {}, token)
}
