export interface Order {
  id: number
  organization: number
  buyer: number
  buyer_name?: string
  style: number
  style_name?: string
  order_number: string
  order_date: string
  delivery_date: string
  quantity: number
  unit_price: string
  total_value: string
  status: string
  priority: string
  notes?: string
}

export interface OrdersListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Order[]
}

export interface PurchaseOrder {
  id: number
  po_number: string
  buyer_name: string
  style_name: string
  quantity: number
  total_value: string
  status: string
  delivery_date: string
}

export interface BuyerPortfolio {
  buyer_id: number
  buyer_name: string
  active_orders: number
  total_units: number
  total_value: number
}
