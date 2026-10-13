'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchOperationStatus,
  isReplayableOperationState,
  isTerminalOperationState,
  replayOperation,
  type OperationRecord,
  type OperationState,
} from '@/lib/api/operations'

export interface UseOperationStatusOptions<TResponse = unknown> {
  pollIntervalMs?: number
  enabled?: boolean
  onSucceeded?: (record: OperationRecord<TResponse>) => void
  onRejected?: (record: OperationRecord<TResponse>) => void
  onError?: (error: unknown) => void
}

export interface UseOperationStatusResult<TResponse = unknown> {
  operation: OperationRecord<TResponse> | null
  status: OperationState | 'IDLE'
  isLoading: boolean
  isPolling: boolean
  isTerminal: boolean
  isReplayable: boolean
  error: Error | null
  replay: () => Promise<OperationRecord<TResponse> | null>
  refetch: () => Promise<void>
}

export function useOperationStatus<TResponse = unknown>(
  operationUuid: string | null | undefined,
  options: UseOperationStatusOptions<TResponse> = {}
): UseOperationStatusResult<TResponse> {
  const {
    pollIntervalMs = 1500,
    enabled = true,
    onSucceeded,
    onRejected,
    onError,
  } = options

  const [operation, setOperation] = useState<OperationRecord<TResponse> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isPolling, setIsPolling] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const activeUuid = operationUuid?.trim() || null
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef<boolean>(true)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const fetchStatus = useCallback(async (isInitial = false) => {
    if (!activeUuid) return

    if (isInitial) {
      setIsLoading(true)
    }

    try {
      const data = await fetchOperationStatus<TResponse>(activeUuid)
      if (!isMountedRef.current) return

      setOperation(data)
      setError(null)
      setIsLoading(false)

      if (data.status === 'SUCCEEDED') {
        setIsPolling(false)
        onSucceeded?.(data)
      } else if (data.status === 'REJECTED' || data.status === 'DEAD_LETTER') {
        setIsPolling(false)
        onRejected?.(data)
      } else if (data.status === 'OUTCOME_UNKNOWN') {
        setIsPolling(false)
      } else {
        // PENDING, CLAIMED, RETRY_WAIT -> keep polling
        setIsPolling(true)
        timerRef.current = setTimeout(() => {
          void fetchStatus(false)
        }, pollIntervalMs)
      }
    } catch (err) {
      if (!isMountedRef.current) return
      const caughtError = err instanceof Error ? err : new Error(String(err))
      setError(caughtError)
      setIsLoading(false)
      setIsPolling(false)
      onError?.(caughtError)
    }
  }, [activeUuid, pollIntervalMs, onSucceeded, onRejected, onError])

  useEffect(() => {
    isMountedRef.current = true
    clearTimer()

    if (activeUuid && enabled) {
      void fetchStatus(true)
    } else {
      setOperation(null)
      setIsLoading(false)
      setIsPolling(false)
      setError(null)
    }

    return () => {
      isMountedRef.current = false
      clearTimer()
    }
  }, [activeUuid, enabled, fetchStatus, clearTimer])

  const replay = useCallback(async (): Promise<OperationRecord<TResponse> | null> => {
    if (!activeUuid) return null

    setIsLoading(true)
    try {
      const replayed = await replayOperation<TResponse>(activeUuid)
      setOperation(replayed)
      setError(null)
      setIsLoading(false)

      if (!isTerminalOperationState(replayed.status)) {
        setIsPolling(true)
        timerRef.current = setTimeout(() => {
          void fetchStatus(false)
        }, pollIntervalMs)
      }
      return replayed
    } catch (err) {
      const caughtError = err instanceof Error ? err : new Error(String(err))
      setError(caughtError)
      setIsLoading(false)
      onError?.(caughtError)
      return null
    }
  }, [activeUuid, pollIntervalMs, fetchStatus, onError])

  const refetch = useCallback(async () => {
    clearTimer()
    await fetchStatus(true)
  }, [clearTimer, fetchStatus])

  const currentState = operation?.status ?? 'IDLE'

  return {
    operation,
    status: currentState,
    isLoading,
    isPolling,
    isTerminal: operation ? isTerminalOperationState(operation.status) : false,
    isReplayable: operation ? isReplayableOperationState(operation.status) : false,
    error,
    replay,
    refetch,
  }
}
