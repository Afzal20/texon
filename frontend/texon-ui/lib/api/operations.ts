import apiClient from './client'

export type OperationState =
  | 'PENDING'
  | 'CLAIMED'
  | 'RETRY_WAIT'
  | 'OUTCOME_UNKNOWN'
  | 'REJECTED'
  | 'SUCCEEDED'
  | 'DEAD_LETTER'

export interface OperationRecord<TResponse = unknown> {
  operation_uuid: string
  status: OperationState
  command_name: string
  aggregate_id: string
  company_id: number
  attempt_count: number
  max_attempts: number
  next_attempt_at: string | null
  response_data: TResponse | null
  error_code: string
  error_message: string
  created_at: string
  updated_at: string
}

export function isTerminalOperationState(status: OperationState): boolean {
  return status === 'SUCCEEDED' || status === 'REJECTED' || status === 'DEAD_LETTER' || status === 'OUTCOME_UNKNOWN'
}

export function isReplayableOperationState(status: OperationState): boolean {
  return status === 'OUTCOME_UNKNOWN' || status === 'DEAD_LETTER' || status === 'RETRY_WAIT'
}

export async function fetchOperationStatus<TResponse = unknown>(
  operationUuid: string
): Promise<OperationRecord<TResponse>> {
  const response = await apiClient.get<OperationRecord<TResponse>>(
    `/api/v1/operations/${encodeURIComponent(operationUuid)}/`
  )
  return response.data
}

export async function replayOperation<TResponse = unknown>(
  operationUuid: string
): Promise<OperationRecord<TResponse>> {
  const response = await apiClient.post<OperationRecord<TResponse>>(
    `/api/v1/operations/${encodeURIComponent(operationUuid)}/replay/`
  )
  return response.data
}

export async function fetchOperationsList(
  limit: number = 30
): Promise<OperationRecord[]> {
  const response = await apiClient.get<OperationRecord[]>('/api/v1/operations/', {
    params: { limit },
  })
  return response.data
}

export async function submitCommand<TResponse = unknown>(
  commandName: string,
  parameters: Record<string, unknown>,
  aggregateId: string = 'AGG',
  expectedRevision?: string
): Promise<OperationRecord<TResponse>> {
  const response = await apiClient.post<OperationRecord<TResponse>>('/api/v1/commands/', {
    command_name: commandName,
    parameters,
    aggregate_id: aggregateId,
    expected_revision: expectedRevision,
  })
  return response.data
}

export interface OdooWorkspaceResponse<T = Record<string, unknown>> {
  results: T[]
  count: number
  as_of: string
  company_id: number
}

export async function fetchOdooWorkspace<T = Record<string, unknown>>(
  section: string = 'sales',
  limit: number = 20,
  offset: number = 0
): Promise<OdooWorkspaceResponse<T>> {
  const response = await apiClient.get<OdooWorkspaceResponse<T>>('/api/v1/odoo/workspace/', {
    params: { section, limit, offset },
  })
  return response.data
}

