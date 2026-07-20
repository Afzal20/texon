"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { apiFetch } from "@/lib/api"
import type { Fabric, Accessory, StockMovement, InventorySummary } from "./inventory"

async function getToken(): Promise<string> {
  const token = await getApiToken()
  if (!token) throw new Error("Not authenticated")
  return token
}

export async function getFabrics(search?: string): Promise<Fabric[]> {
  const token = await getToken()
  const params = search ? `?search=${search}` : ""
  return apiFetch(`/api/v1/fabrics/${params}`, {}, token)
}

export async function getAccessories(): Promise<Accessory[]> {
  const token = await getToken()
  return apiFetch("/api/v1/accessories/", {}, token)
}

export async function getStockMovements(): Promise<StockMovement[]> {
  const token = await getToken()
  return apiFetch("/api/v1/stock-movements/", {}, token)
}

export async function getInventorySummary(): Promise<InventorySummary> {
  const token = await getToken()
  return apiFetch("/api/v1/inventory/summary/", {}, token)
}
