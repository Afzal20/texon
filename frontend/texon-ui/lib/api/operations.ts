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
