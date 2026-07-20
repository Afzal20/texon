"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { apiFetch } from "@/lib/api"
import type { AccountsPayable, AccountsReceivable, JournalEntry, AccountsSummary } from "./accounts"

async function getToken(): Promise<string> {
  const token = await getApiToken()
  if (!token) throw new Error("Not authenticated")
  return token
}

export async function getAccountsPayable(): Promise<AccountsPayable[]> {
  const token = await getToken()
  return apiFetch("/api/v1/accounts-payable/", {}, token)
}

export async function getAccountsReceivable(): Promise<AccountsReceivable[]> {
  const token = await getToken()
  return apiFetch("/api/v1/accounts-receivable/", {}, token)
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const token = await getToken()
  return apiFetch("/api/v1/journal-entries/", {}, token)
}

export async function getAccountsSummary(): Promise<AccountsSummary> {
  const token = await getToken()
  return apiFetch("/api/v1/accounts/summary/", {}, token)
}
