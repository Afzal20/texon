import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import apiClient from './client'
import {
  fetchOperationStatus,
  replayOperation,
  isTerminalOperationState,
  isReplayableOperationState,
  type OperationRecord,
} from './operations'
import { useOperationStatus } from '@/hooks/use-operation-status'

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('operations client API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches operation status with encoded uuid', async () => {
    const mockRecord: OperationRecord = {
      operation_uuid: 'op-123',
      status: 'SUCCEEDED',
      command_name: 'sales.create',
      aggregate_id: 'SO-100',
      company_id: 1,
      attempt_count: 1,
      max_attempts: 5,
      next_attempt_at: null,
      response_data: { id: 10 },
      error_code: '',
      error_message: '',
      created_at: '2026-10-13T12:00:00Z',
      updated_at: '2026-10-13T12:00:01Z',
    }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockRecord })

    const res = await fetchOperationStatus('op-123')
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/operations/op-123/')
    expect(res).toEqual(mockRecord)
  })

  it('posts replay request to operation replay endpoint', async () => {
    const mockRecord: OperationRecord = {
      operation_uuid: 'op-123',
      status: 'SUCCEEDED',
      command_name: 'sales.create',
      aggregate_id: 'SO-100',
      company_id: 1,
      attempt_count: 2,
      max_attempts: 5,
      next_attempt_at: null,
      response_data: { id: 10 },
      error_code: '',
      error_message: '',
      created_at: '2026-10-13T12:00:00Z',
      updated_at: '2026-10-13T12:00:05Z',
    }
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRecord })

    const res = await replayOperation('op-123')
    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/operations/op-123/replay/')
    expect(res.status).toBe('SUCCEEDED')
  })

  it('correctly classifies terminal and replayable states', () => {
    expect(isTerminalOperationState('PENDING')).toBe(false)
    expect(isTerminalOperationState('CLAIMED')).toBe(false)
    expect(isTerminalOperationState('RETRY_WAIT')).toBe(false)
    expect(isTerminalOperationState('SUCCEEDED')).toBe(true)
    expect(isTerminalOperationState('REJECTED')).toBe(true)
    expect(isTerminalOperationState('DEAD_LETTER')).toBe(true)
    expect(isTerminalOperationState('OUTCOME_UNKNOWN')).toBe(true)

    expect(isReplayableOperationState('SUCCEEDED')).toBe(false)
    expect(isReplayableOperationState('OUTCOME_UNKNOWN')).toBe(true)
    expect(isReplayableOperationState('DEAD_LETTER')).toBe(true)
    expect(isReplayableOperationState('RETRY_WAIT')).toBe(true)
  })
})

describe('useOperationStatus hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts idle when no operation uuid is provided', () => {
    const { result } = renderHook(() => useOperationStatus(null))
    expect(result.current.status).toBe('IDLE')
    expect(result.current.isLoading).toBe(false)
    expect(result.current.operation).toBeNull()
  })

  it('polls during PENDING state and completes on SUCCEEDED without false success', async () => {
    const pendingRecord: OperationRecord = {
      operation_uuid: 'uuid-1',
      status: 'PENDING',
      command_name: 'sales.create',
      aggregate_id: 'SO-1',
      company_id: 1,
      attempt_count: 0,
      max_attempts: 5,
      next_attempt_at: null,
      response_data: null,
      error_code: '',
      error_message: '',
      created_at: '2026-10-13T12:00:00Z',
      updated_at: '2026-10-13T12:00:00Z',
    }

    const succeededRecord: OperationRecord = {
      ...pendingRecord,
      status: 'SUCCEEDED',
      response_data: { id: 42, name: 'S00042' },
    }

    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: pendingRecord })
      .mockResolvedValueOnce({ data: succeededRecord })

    const onSucceeded = vi.fn()
    const { result } = renderHook(() =>
      useOperationStatus('uuid-1', { pollIntervalMs: 500, onSucceeded })
    )

    // Initial fetch
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(result.current.status).toBe('PENDING')
    expect(result.current.isPolling).toBe(true)
    expect(onSucceeded).not.toHaveBeenCalled()

    // Advance to trigger poll
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    expect(result.current.status).toBe('SUCCEEDED')
    expect(result.current.isPolling).toBe(false)
    expect(result.current.isTerminal).toBe(true)
    expect(onSucceeded).toHaveBeenCalledWith(succeededRecord)
  })

  it('truthfully transitions to REJECTED and stops polling on business failure', async () => {
    const rejectedRecord: OperationRecord = {
      operation_uuid: 'uuid-fail',
      status: 'REJECTED',
      command_name: 'sales.confirm',
      aggregate_id: 'SO-1',
      company_id: 1,
      attempt_count: 1,
      max_attempts: 5,
      next_attempt_at: null,
      response_data: null,
      error_code: 'BUSINESS_REJECTION',
      error_message: 'No replenishment rule found',
      created_at: '2026-10-13T12:00:00Z',
      updated_at: '2026-10-13T12:00:02Z',
    }

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: rejectedRecord })

    const onRejected = vi.fn()
    const { result } = renderHook(() =>
      useOperationStatus('uuid-fail', { onRejected })
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(result.current.status).toBe('REJECTED')
    expect(result.current.isPolling).toBe(false)
    expect(result.current.isTerminal).toBe(true)
    expect(onRejected).toHaveBeenCalledWith(rejectedRecord)
  })

  it('exposes replay for uncertain outcomes', async () => {
    const unknownRecord: OperationRecord = {
      operation_uuid: 'uuid-unknown',
      status: 'OUTCOME_UNKNOWN',
      command_name: 'sales.confirm',
      aggregate_id: 'SO-1',
      company_id: 1,
      attempt_count: 1,
      max_attempts: 5,
      next_attempt_at: null,
      response_data: null,
      error_code: 'TIMEOUT_AFTER_DISPATCH',
      error_message: 'Gateway timeout',
      created_at: '2026-10-13T12:00:00Z',
      updated_at: '2026-10-13T12:00:05Z',
    }

    const replayedSuccess: OperationRecord = {
      ...unknownRecord,
      status: 'SUCCEEDED',
      response_data: { state: 'sale' },
    }

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: unknownRecord })
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: replayedSuccess })

    const { result } = renderHook(() => useOperationStatus('uuid-unknown'))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(result.current.status).toBe('OUTCOME_UNKNOWN')
    expect(result.current.isReplayable).toBe(true)

    await act(async () => {
      await result.current.replay()
    })

    expect(result.current.status).toBe('SUCCEEDED')
    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/operations/uuid-unknown/replay/')
  })
})
