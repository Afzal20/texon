"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { restList } from "@/lib/api/rest"
import type { Order, OrdersListResponse, PurchaseOrder, BuyerPortfolio } from "./orders"

async function getToken(): Promise<string> {
  const token = await getApiToken()
  if (!token) throw new Error("Not authenticated")
  return token
}

export async function getOrders(search?: string, _page = 1): Promise<OrdersListResponse> {
  void _page
  const token = await getToken()
  const rows = (await restList("orders", "Order", undefined, token)).data as unknown as Order[]
  const filtered = search ? rows.filter((row) => String(row.order_number).includes(search)) : rows
  return {
    count: filtered.length,
    next: null,
    previous: null,
    results: filtered,
  }
}

export async function getPurchaseOrders(search?: string): Promise<PurchaseOrder[]> {
  const token = await getToken()
  const rows = (await restList("merchandising", "PurchaseOrder", undefined, token)).data as unknown as PurchaseOrder[]
  return search ? rows.filter((row) => String(row.po_number).includes(search)) : rows
}

export async function getBuyerPortfolios(): Promise<BuyerPortfolio[]> {
  const token = await getToken()
  const rows = (await restList("buyers", "BuyerPortfolio", undefined, token)).data as unknown as BuyerPortfolio[]
  return rows
}

export async function getDashboardOrdersSummary(): Promise<{
  total_ytd: string
  active_buyers: number
  avg_lead_time_days: number
  samples_pending: number
}> {
  const token = await getToken()
  const [{ data: orders }, { data: samples }] = await Promise.all([
    restList("orders", "Order", undefined, token),
    restList("merchandising", "SampleOrder", undefined, token),
  ])
  const totalValue = orders.reduce((sum, row) => sum + (Number(row.total_value) || 0), 0)
  const leadTimes = orders
    .map((row) => {
      const start = new Date(String(row.order_date ?? "")).getTime()
      const end = new Date(String(row.delivery_date ?? "")).getTime()
      return Number.isFinite(start) && Number.isFinite(end) ? (end - start) / 86400000 : null
    })
    .filter((days): days is number => days !== null)
  const avgLeadTime =
    leadTimes.length > 0 ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length : 0
  const samplesPending = samples.filter((row) =>
    ["pending", "in_progress", "draft", "requested"].includes(String(row.status ?? "")),
  ).length
  return {
    total_ytd: totalValue.toFixed(2),
    active_buyers: orders.length,
    avg_lead_time_days: Math.round(avgLeadTime),
    samples_pending: samplesPending,
  }
}