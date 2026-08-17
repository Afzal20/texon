import { restList, restGet, restCreate, restUpdate, restDelete } from "./rest"

export const getShipments = (params?: Record<string, unknown>) => restList("commercial", "Shipment", params)
export const getShipment = (id: number) => restGet("commercial", "Shipment", id)
export const createShipment = (data: Record<string, unknown>) => restCreate("commercial", "Shipment", data)
export const updateShipment = (id: number, data: Record<string, unknown>) => restUpdate("commercial", "Shipment", id, data)
export const patchShipment = (id: number, data: Record<string, unknown>) => restUpdate("commercial", "Shipment", id, data)
export const deleteShipment = (id: number) => restDelete("commercial", "Shipment", id)
export const getAccountsPayable = (params?: Record<string, unknown>) => restList("accounts", "AccountsPayable", params)
export const getAccountPayable = (id: number) => restGet("accounts", "AccountsPayable", id)
export const createAccountPayable = (data: Record<string, unknown>) => restCreate("accounts", "AccountsPayable", data)
export const updateAccountPayable = (id: number, data: Record<string, unknown>) => restUpdate("accounts", "AccountsPayable", id, data)
export const patchAccountPayable = (id: number, data: Record<string, unknown>) => restUpdate("accounts", "AccountsPayable", id, data)
export const deleteAccountPayable = (id: number) => restDelete("accounts", "AccountsPayable", id)
export const getAccountsReceivable = (params?: Record<string, unknown>) => restList("accounts", "AccountsReceivable", params)
export const getAccountReceivable = (id: number) => restGet("accounts", "AccountsReceivable", id)
export const createAccountReceivable = (data: Record<string, unknown>) => restCreate("accounts", "AccountsReceivable", data)
export const updateAccountReceivable = (id: number, data: Record<string, unknown>) => restUpdate("accounts", "AccountsReceivable", id, data)
export const patchAccountReceivable = (id: number, data: Record<string, unknown>) => restUpdate("accounts", "AccountsReceivable", id, data)
export const deleteAccountReceivable = (id: number) => restDelete("accounts", "AccountsReceivable", id)
export const getBillsOfExchange = (params?: Record<string, unknown>) => restList("commercial", "BillOfExchange", params)
export const getBillOfExchange = (id: number) => restGet("commercial", "BillOfExchange", id)
export const createBillOfExchange = (data: Record<string, unknown>) => restCreate("commercial", "BillOfExchange", data)
export const updateBillOfExchange = (id: number, data: Record<string, unknown>) => restUpdate("commercial", "BillOfExchange", id, data)
export const patchBillOfExchange = (id: number, data: Record<string, unknown>) => restUpdate("commercial", "BillOfExchange", id, data)
export const deleteBillOfExchange = (id: number) => restDelete("commercial", "BillOfExchange", id)
export const getInvoices = (params?: Record<string, unknown>) => restList("commercial", "Invoice", params)
export const getInvoice = (id: number) => restGet("commercial", "Invoice", id)
export const createInvoice = (data: Record<string, unknown>) => restCreate("commercial", "Invoice", data)
export const updateInvoice = (id: number, data: Record<string, unknown>) => restUpdate("commercial", "Invoice", id, data)
export const patchInvoice = (id: number, data: Record<string, unknown>) => restUpdate("commercial", "Invoice", id, data)
export const deleteInvoice = (id: number) => restDelete("commercial", "Invoice", id)
export const getJournalEntries = (params?: Record<string, unknown>) => restList("accounts", "JournalEntry", params)
export const getJournalEntry = (id: number) => restGet("accounts", "JournalEntry", id)
export const createJournalEntry = (data: Record<string, unknown>) => restCreate("accounts", "JournalEntry", data)
export const updateJournalEntry = (id: number, data: Record<string, unknown>) => restUpdate("accounts", "JournalEntry", id, data)
export const patchJournalEntry = (id: number, data: Record<string, unknown>) => restUpdate("accounts", "JournalEntry", id, data)
export const deleteJournalEntry = (id: number) => restDelete("accounts", "JournalEntry", id)
export const getLcs = (params?: Record<string, unknown>) => restList("commercial", "LetterOfCredit", params)
export const getLc = (id: number) => restGet("commercial", "LetterOfCredit", id)
export const createLc = (data: Record<string, unknown>) => restCreate("commercial", "LetterOfCredit", data)
export const updateLc = (id: number, data: Record<string, unknown>) => restUpdate("commercial", "LetterOfCredit", id, data)
export const patchLc = (id: number, data: Record<string, unknown>) => restUpdate("commercial", "LetterOfCredit", id, data)
export const deleteLc = (id: number) => restDelete("commercial", "LetterOfCredit", id)
export const getExpenses = (params?: Record<string, unknown>) => restList("accounts", "Expense", params)
export const getExpense = (id: number) => restGet("accounts", "Expense", id)
export const createExpense = (data: Record<string, unknown>) => restCreate("accounts", "Expense", data)
export const updateExpense = (id: number, data: Record<string, unknown>) => restUpdate("accounts", "Expense", id, data)
export const patchExpense = (id: number, data: Record<string, unknown>) => restUpdate("accounts", "Expense", id, data)
export const deleteExpense = (id: number) => restDelete("accounts", "Expense", id)
export const getAccountsSummary = async (params?: Record<string, unknown>) => {
  const [{ data: payable }, { data: receivable }, { data: journal }, { data: expense }] = await Promise.all([
    restList("accounts", "AccountsPayable", params),
    restList("accounts", "AccountsReceivable", params),
    restList("accounts", "JournalEntry", params),
    restList("accounts", "Expense", params),
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
