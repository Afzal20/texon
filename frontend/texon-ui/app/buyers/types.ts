export interface BuyerRating {
  id: number
  rating: number
  reviews_count: number
}

export interface Buyer {
  id: number
  organization: number
  name: string
  code: string
  country: string
  address?: string
  contact_person?: string
  email?: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
  rating?: BuyerRating
}

export interface BuyerPortfolio {
  buyer_id: number
  active_orders: number
  total_units: number
  total_value: number
}

export interface BuyersListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Buyer[]
}
