export interface ProductionLine {
  id: number
  name: string
  code: string
  location?: string
  capacity: number
  is_active: boolean
}

export interface ProductionOrder {
  id: number
  order_number: string
  purchase_order: number
  style: number
  style_name?: string
  production_line: number
  line_name?: string
  quantity: number
  start_date: string
  end_date: string
  status: string
}

export interface SewingRecord {
  id: number
  production_order: number
  production_line: number
  date: string
  input_quantity: number
  output_quantity: number
  defect_quantity: number
  efficiency: number
}

export interface PerformanceRecord {
  id: number
  style: number
  production_line: number
  line_name?: string
  record_date: string
  metric: string
  value: number
  target: number
  unit: string
}

export interface ProductionDashboard {
  total_orders: number
  order_trend: string
  output_percentage: number
  output_actual: number
  output_target: number
  delay_risk_percentage: number
  delay_risk_note: string
  active_lines: number
  total_lines: number
  lines_running: number
  lines_error: number
  lines_idle: number
}
