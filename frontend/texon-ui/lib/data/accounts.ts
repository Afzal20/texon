export interface AccountsPayable {
  id: number
  supplier_name?: string
  invoice_number: string
  invoice_date: string
  due_date: string
  amount: string
  paid_amount: string
  balance: string
  status: string
}

export interface AccountsReceivable {
  id: number
  buyer_name?: string
  invoice_number: string
  invoice_date: string
  due_date: string
  amount: string
  received_amount: string
  balance: string
  status: string
}

export interface JournalEntry {
  id: number
  entry_number: string
  entry_date: string
  description: string
  debit: string
  credit: string
  account_name?: string
}

export interface AccountsSummary {
  cash_available: string
  cash_trend: string
  receivables_due: string
  receivables_count: number
  payables_scheduled: string
  payables_note: string
  portfolio_contribution: string
  portfolio_margin: string
  total_revenue: string
  total_expenses: string
}
