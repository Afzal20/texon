import { gqlList, gqlGet, gqlCreate, gqlUpdate, gqlDelete } from "./graphql"

export const getShipments = (params?: Record<string, unknown>) => gqlList("commercial", "Shipment", params)
export const getShipment = (id: number) => gqlGet("commercial", "Shipment", id)
export const createShipment = (data: Record<string, unknown>) => gqlCreate("commercial", "Shipment", data)
export const updateShipment = (id: number, data: Record<string, unknown>) => gqlUpdate("commercial", "Shipment", id, data)
export const patchShipment = (id: number, data: Record<string, unknown>) => gqlUpdate("commercial", "Shipment", id, data)
export const deleteShipment = (id: number) => gqlDelete("commercial", "Shipment", id)
export const getAccountsPayable = (params?: Record<string, unknown>) => gqlList("accounts", "AccountsPayable", params)
export const getAccountPayable = (id: number) => gqlGet("accounts", "AccountsPayable", id)
export const createAccountPayable = (data: Record<string, unknown>) => gqlCreate("accounts", "AccountsPayable", data)
export const updateAccountPayable = (id: number, data: Record<string, unknown>) => gqlUpdate("accounts", "AccountsPayable", id, data)
export const patchAccountPayable = (id: number, data: Record<string, unknown>) => gqlUpdate("accounts", "AccountsPayable", id, data)
export const deleteAccountPayable = (id: number) => gqlDelete("accounts", "AccountsPayable", id)
export const getAccountsReceivable = (params?: Record<string, unknown>) => gqlList("accounts", "AccountsReceivable", params)
export const getAccountReceivable = (id: number) => gqlGet("accounts", "AccountsReceivable", id)
export const createAccountReceivable = (data: Record<string, unknown>) => gqlCreate("accounts", "AccountsReceivable", data)
export const updateAccountReceivable = (id: number, data: Record<string, unknown>) => gqlUpdate("accounts", "AccountsReceivable", id, data)
export const patchAccountReceivable = (id: number, data: Record<string, unknown>) => gqlUpdate("accounts", "AccountsReceivable", id, data)
export const deleteAccountReceivable = (id: number) => gqlDelete("accounts", "AccountsReceivable", id)
export const getBillsOfExchange = (params?: Record<string, unknown>) => gqlList("commercial", "BillOfExchange", params)
export const getBillOfExchange = (id: number) => gqlGet("commercial", "BillOfExchange", id)
export const createBillOfExchange = (data: Record<string, unknown>) => gqlCreate("commercial", "BillOfExchange", data)
export const updateBillOfExchange = (id: number, data: Record<string, unknown>) => gqlUpdate("commercial", "BillOfExchange", id, data)
export const patchBillOfExchange = (id: number, data: Record<string, unknown>) => gqlUpdate("commercial", "BillOfExchange", id, data)
export const deleteBillOfExchange = (id: number) => gqlDelete("commercial", "BillOfExchange", id)
export const getInvoices = (params?: Record<string, unknown>) => gqlList("commercial", "Invoice", params)
export const getInvoice = (id: number) => gqlGet("commercial", "Invoice", id)
export const createInvoice = (data: Record<string, unknown>) => gqlCreate("commercial", "Invoice", data)
export const updateInvoice = (id: number, data: Record<string, unknown>) => gqlUpdate("commercial", "Invoice", id, data)
export const patchInvoice = (id: number, data: Record<string, unknown>) => gqlUpdate("commercial", "Invoice", id, data)
export const deleteInvoice = (id: number) => gqlDelete("commercial", "Invoice", id)
export const getJournalEntries = (params?: Record<string, unknown>) => gqlList("accounts", "JournalEntry", params)
export const getJournalEntry = (id: number) => gqlGet("accounts", "JournalEntry", id)
export const createJournalEntry = (data: Record<string, unknown>) => gqlCreate("accounts", "JournalEntry", data)
export const updateJournalEntry = (id: number, data: Record<string, unknown>) => gqlUpdate("accounts", "JournalEntry", id, data)
export const patchJournalEntry = (id: number, data: Record<string, unknown>) => gqlUpdate("accounts", "JournalEntry", id, data)
export const deleteJournalEntry = (id: number) => gqlDelete("accounts", "JournalEntry", id)
export const getLcs = (params?: Record<string, unknown>) => gqlList("commercial", "LetterOfCredit", params)
export const getLc = (id: number) => gqlGet("commercial", "LetterOfCredit", id)
export const createLc = (data: Record<string, unknown>) => gqlCreate("commercial", "LetterOfCredit", data)
export const updateLc = (id: number, data: Record<string, unknown>) => gqlUpdate("commercial", "LetterOfCredit", id, data)
export const patchLc = (id: number, data: Record<string, unknown>) => gqlUpdate("commercial", "LetterOfCredit", id, data)
export const deleteLc = (id: number) => gqlDelete("commercial", "LetterOfCredit", id)
export const getExpenses = (params?: Record<string, unknown>) => gqlList("accounts", "Expense", params)
export const getExpense = (id: number) => gqlGet("accounts", "Expense", id)
export const createExpense = (data: Record<string, unknown>) => gqlCreate("accounts", "Expense", data)
export const updateExpense = (id: number, data: Record<string, unknown>) => gqlUpdate("accounts", "Expense", id, data)
export const patchExpense = (id: number, data: Record<string, unknown>) => gqlUpdate("accounts", "Expense", id, data)
export const deleteExpense = (id: number) => gqlDelete("accounts", "Expense", id)
export const getAccountsSummary = async (params?: Record<string, unknown>) => {
  const [{ data: payable }, { data: receivable }, { data: journal }, { data: expense }] = await Promise.all([
    gqlList("accounts", "AccountsPayable", params),
    gqlList("accounts", "AccountsReceivable", params),
    gqlList("accounts", "JournalEntry", params),
    gqlList("accounts", "Expense", params),
  ])
  const payables = payable ?? []
  const receivables = receivable ?? []
  const journalEntries = journal ?? []
  const expenses = expense ?? []
  const sum = (rows: Record<string, unknown>[], key: string) =>
    rows.reduce((total, row) => total + (Number(row[key]) || 0), 0)
  const receivablesDue = sum(receivables, "balance")
  const payablesScheduled = sum(payables, "balance")
  const totalRevenue = sum(receivables, "amount")
  const totalExpenses = sum(expenses, "amount")
  const cash = Math.max(0, sum(journalEntries, "debit") - sum(journalEntries, "credit"))
  return {
    data: {
      cash_available: cash.toFixed(2),
      cash_trend: "up",
      receivables_due: receivablesDue.toFixed(2),
      receivables_count: receivables.length,
      payables_scheduled: payablesScheduled.toFixed(2),
      payables_note: `${payables.length} open payables`,
      portfolio_contribution: totalRevenue.toFixed(2),
      portfolio_margin: "0.00",
      total_revenue: totalRevenue.toFixed(2),
      total_expenses: totalExpenses.toFixed(2),
    },
  }
}
