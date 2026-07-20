import apiClient from './client'

// ─── Accounts Payable ────────────────────────────────────────────────────────

export const getAccountsPayable = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/accounts-payable/', { params })

export const getAccountPayable = (id: number) =>
  apiClient.get(`/api/v1/accounts-payable/${id}/`)

export const createAccountPayable = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/accounts-payable/', data)

export const updateAccountPayable = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/accounts-payable/${id}/`, data)

export const patchAccountPayable = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/accounts-payable/${id}/`, data)

export const deleteAccountPayable = (id: number) =>
  apiClient.delete(`/api/v1/accounts-payable/${id}/`)

// ─── Accounts Receivable ─────────────────────────────────────────────────────

export const getAccountsReceivable = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/accounts-receivable/', { params })

export const getAccountReceivable = (id: number) =>
  apiClient.get(`/api/v1/accounts-receivable/${id}/`)

export const createAccountReceivable = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/accounts-receivable/', data)

export const updateAccountReceivable = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/accounts-receivable/${id}/`, data)

export const patchAccountReceivable = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/accounts-receivable/${id}/`, data)

export const deleteAccountReceivable = (id: number) =>
  apiClient.delete(`/api/v1/accounts-receivable/${id}/`)

// ─── Bills of Exchange ───────────────────────────────────────────────────────

export const getBillsOfExchange = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/bills-of-exchange/', { params })

export const getBillOfExchange = (id: number) =>
  apiClient.get(`/api/v1/bills-of-exchange/${id}/`)

export const createBillOfExchange = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/bills-of-exchange/', data)

export const updateBillOfExchange = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/bills-of-exchange/${id}/`, data)

export const patchBillOfExchange = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/bills-of-exchange/${id}/`, data)

export const deleteBillOfExchange = (id: number) =>
  apiClient.delete(`/api/v1/bills-of-exchange/${id}/`)

// ─── Invoices ────────────────────────────────────────────────────────────────

export const getInvoices = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/invoices/', { params })

export const getInvoice = (id: number) =>
  apiClient.get(`/api/v1/invoices/${id}/`)

export const createInvoice = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/invoices/', data)

export const updateInvoice = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/invoices/${id}/`, data)

export const patchInvoice = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/invoices/${id}/`, data)

export const deleteInvoice = (id: number) =>
  apiClient.delete(`/api/v1/invoices/${id}/`)

// ─── Journal Entries ─────────────────────────────────────────────────────────

export const getJournalEntries = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/journal-entries/', { params })

export const getJournalEntry = (id: number) =>
  apiClient.get(`/api/v1/journal-entries/${id}/`)

export const createJournalEntry = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/journal-entries/', data)

export const updateJournalEntry = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/journal-entries/${id}/`, data)

export const patchJournalEntry = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/journal-entries/${id}/`, data)

export const deleteJournalEntry = (id: number) =>
  apiClient.delete(`/api/v1/journal-entries/${id}/`)

// ─── LCs ─────────────────────────────────────────────────────────────────────

export const getLcs = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/lcs/', { params })

export const getLc = (id: number) =>
  apiClient.get(`/api/v1/lcs/${id}/`)

export const createLc = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/lcs/', data)

export const updateLc = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/lcs/${id}/`, data)

export const patchLc = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/lcs/${id}/`, data)

export const deleteLc = (id: number) =>
  apiClient.delete(`/api/v1/lcs/${id}/`)

// ─── Expenses ────────────────────────────────────────────────────────────────

export const getExpenses = (params?: Record<string, unknown>) =>
  apiClient.get('/api/v1/expenses/', { params })

export const getExpense = (id: number) =>
  apiClient.get(`/api/v1/expenses/${id}/`)

export const createExpense = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/expenses/', data)

export const updateExpense = (id: number, data: Record<string, unknown>) =>
  apiClient.put(`/api/v1/expenses/${id}/`, data)

export const patchExpense = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/expenses/${id}/`, data)

export const deleteExpense = (id: number) =>
  apiClient.delete(`/api/v1/expenses/${id}/`)

// ─── Accounts Summary ─────────────────────────────────────────────────────────

export const getAccountsSummary = () =>
  apiClient.get('/api/v1/accounts/summary/')
