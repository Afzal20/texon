"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { restList } from "@/lib/api/rest"
import type { AccountsPayable, AccountsReceivable, JournalEntry, AccountsSummary } from "./accounts"

async function getToken(): Promise<string> {
  const token = await getApiToken()
  if (!token) throw new Error("Not authenticated")
  return token
}

export async function getAccountsPayable(): Promise<AccountsPayable[]> {
  const token = await getToken()
  return (await restList("accounts", "AccountsPayable", undefined, token)).data as unknown as AccountsPayable[]
}

export async function getAccountsReceivable(): Promise<AccountsReceivable[]> {
  const token = await getToken()
  return (await restList("accounts", "AccountsReceivable", undefined, token)).data as unknown as AccountsReceivable[]
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const token = await getToken()
  return (await restList("accounts", "JournalEntry", undefined, token)).data as unknown as JournalEntry[]
}

export async function getAccountsSummary(): Promise<AccountsSummary> {
  const token = await getToken()
  const [{ data: payable }, { data: receivable }, { data: journal }, { data: expense }] = await Promise.all([
    restList("accounts", "AccountsPayable", undefined, token),
    restList("accounts", "AccountsReceivable", undefined, token),
    restList("accounts", "JournalEntry", undefined, token),
    restList("accounts", "Expense", undefined, token),
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
  }
}