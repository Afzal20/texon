"use server"

import { getApiToken } from "@/auth/lib/api-client"
import { restList } from "@/lib/api/rest"
import type { ComplianceRecord, ComplianceDocument, ComplianceSummary } from "./compliance"

async function getToken(): Promise<string> {
  const token = await getApiToken()
  if (!token) throw new Error("Not authenticated")
  return token
}

export async function getComplianceRecords(): Promise<ComplianceRecord[]> {
  const token = await getToken()
  return (await restList("compliance", "ComplianceRecord", undefined, token)).data as unknown as ComplianceRecord[]
}

export async function getComplianceSummary(): Promise<ComplianceSummary> {
  const token = await getToken()
  const { data: records } = await restList("compliance", "ComplianceRecord", undefined, token)
  const scores = records.map((row) => Number(row.score) || 0)
  const overall =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const byType = (needle: string) => {
    const matches = records.filter((row) => String(row.compliance_type ?? "").toLowerCase().includes(needle))
    if (matches.length === 0) return overall
    const values = matches.map((row) => Number(row.score) || 0)
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
  }
  return {
    overall_score: overall,
    social_score: byType("social"),
    environmental_score: byType("environment"),
    safety_score: byType("safety"),
    carbon_footprint: 0,
    water_recycled_percentage: 0,
    renewable_energy_percentage: 0,
  }
}

export async function getDocuments(): Promise<ComplianceDocument[]> {
  return []
}