export interface ComplianceRecord {
  id: number
  buyer: number
  buyer_name?: string
  compliance_type: string
  title: string
  description?: string
  audit_date: string
  audit_by?: string
  score: number
  status: string
  findings?: string
  corrective_actions?: string
  follow_up_date?: string
}

export interface ComplianceDocument {
  id: number
  type: string
  authority: string
  expiry_date: string
  status: string
  file?: string
}

export interface ComplianceSummary {
  overall_score: number
  social_score: number
  environmental_score: number
  safety_score: number
  carbon_footprint: number
  water_recycled_percentage: number
  renewable_energy_percentage: number
}
