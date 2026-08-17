"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { restList } from "@/lib/api/rest"
import type { Fabric, Accessory, StockMovement, InventorySummary } from "./inventory"

async function getToken(): Promise<string> {
  const token = await getApiToken()
  if (!token) throw new Error("Not authenticated")
  return token
}

export async function getFabrics(search?: string): Promise<Fabric[]> {
  const token = await getToken()
  const rows = (await restList("inventory", "Fabric", undefined, token)).data as unknown as Fabric[]
  return search
    ? rows.filter((row) => `${row.name} ${row.code} ${row.color}`.toLowerCase().includes(search.toLowerCase()))
    : rows
}

export async function getAccessories(): Promise<Accessory[]> {
  const token = await getToken()
  return (await restList("inventory", "Accessory", undefined, token)).data as unknown as Accessory[]
}

export async function getStockMovements(): Promise<StockMovement[]> {
  const token = await getToken()
  return (await restList("inventory", "StockMovement", undefined, token)).data as unknown as StockMovement[]
}

export async function getInventorySummary(): Promise<InventorySummary> {
  const token = await getToken()
  const [{ data: fabrics }, { data: accessories }, { data: trims }] = await Promise.all([
    restList("inventory", "Fabric", undefined, token),
    restList("inventory", "Accessory", undefined, token),
    restList("inventory", "Trim", undefined, token),
  ])
  const deadstockAlerts = [...fabrics, ...accessories, ...trims].filter((row) => Number(row.quantity) <= 0).length
  const lowStockAlerts = [...fabrics, ...accessories, ...trims].filter(
    (row) => Number(row.quantity) > 0 && Number(row.quantity) < Number(row.threshold_quantity),
  ).length
  const totalValue = fabrics.reduce(
    (sum, row) => sum + (Number(row.quantity) || 0) * (Number(row.unit_price) || 0),
    0,
  )
  return {
    total_fabrics: fabrics.length,
    total_accessories: accessories.length,
    total_trims: trims.length,
    deadstock_alerts: deadstockAlerts,
    low_stock_alerts: lowStockAlerts,
    total_value: totalValue.toFixed(2),
  }
}