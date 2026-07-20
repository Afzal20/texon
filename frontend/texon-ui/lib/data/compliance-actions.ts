"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { apiFetch } from "@/lib/api"
import type { ComplianceRecord, ComplianceDocument, ComplianceSummary } from "./compliance"

async function getToken(): Promise<string> {
  const token = await getApiToken()
  if (!token) throw new Error("Not authenticated")
  return token
}

export async function getComplianceRecords(): Promise<ComplianceRecord[]> {
  const token = await getToken()
  return apiFetch("/api/v1/compliance-records/", {}, token)
}

export async function getComplianceSummary(): Promise<ComplianceSummary> {
  const token = await getToken()
  return apiFetch("/api/v1/compliance/summary/", {}, token)
}

export async function getDocuments(): Promise<ComplianceDocument[]> {
  const token = await getToken()
  return apiFetch("/api/v1/compliance/documents/", {}, token)
}
