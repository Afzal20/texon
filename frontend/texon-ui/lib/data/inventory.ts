export interface Fabric {
  id: number
  name: string
  code: string
  color: string
  composition: string
  quantity: number
  unit: string
  threshold_quantity: number
  unit_price: string
  warehouse_name?: string
}

export interface Accessory {
  id: number
  name: string
  code: string
  category: string
  quantity: number
  unit: string
  threshold_quantity: number
}

export interface StockMovement {
  id: number
  item_type: string
  movement_type: string
  quantity: number
  reference_number: string
  notes?: string
  created_at: string
}

export interface InventorySummary {
  total_fabrics: number
  total_accessories: number
  total_trims: number
  deadstock_alerts: number
  low_stock_alerts: number
  total_value: string
}
