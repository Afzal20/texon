"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { apiFetch } from "@/lib/api"
import type { Order, OrdersListResponse, PurchaseOrder, BuyerPortfolio } from "./orders"

async function getToken(): Promise<string> {
  const token = await getApiToken()
  if (!token) throw new Error("Not authenticated")
  return token
}

export async function getOrders(search?: string, page = 1): Promise<OrdersListResponse> {
  const token = await getToken()
  const params = new URLSearchParams()
  if (search) params.set("search", search)
  params.set("page", String(page))
  return apiFetch(`/api/v1/orders/?${params}`, {}, token)
}

export async function getPurchaseOrders(search?: string): Promise<PurchaseOrder[]> {
  const token = await getToken()
  return apiFetch(`/api/v1/purchase-orders/${search ? `?search=${search}` : ""}`, {}, token)
}

export async function getBuyerPortfolios(): Promise<BuyerPortfolio[]> {
  const token = await getToken()
  return apiFetch("/api/v1/buyer-portfolios/", {}, token)
}

export async function getDashboardOrdersSummary(): Promise<{
  total_ytd: string
  active_buyers: number
  avg_lead_time_days: number
  samples_pending: number
}> {
  const token = await getToken()
  return apiFetch("/api/v1/orders/dashboard-summary/", {}, token)
}
