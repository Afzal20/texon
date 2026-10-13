import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useModuleRows, type ModuleSource } from "./module-data"
import { restList, type RestListResult } from "./rest"

vi.mock("./rest", () => ({ restList: vi.fn() }))
const list = vi.mocked(restList)
const buyers: ModuleSource[] = [{ key: "buyers", app: "buyers", model: "Buyer" }]

function deferred() {
  let resolve!: (value: RestListResult) => void
  const promise = new Promise<RestListResult>((done) => { resolve = done })
  return { promise, resolve }
}

beforeEach(() => list.mockReset())

describe("workspace data lifecycle", () => {
  it("keeps the loading state until every source has returned", async () => {
    const pending = deferred()
    list.mockResolvedValueOnce({ data: [{ id: 1, name: "Buyer" }] })
    list.mockReturnValueOnce(pending.promise)
    const { result } = renderHook(() => useModuleRows([
      ...buyers, { key: "orders", app: "orders", model: "Order" },
    ]))
    expect(result.current.isLoading).toBe(true)
    await act(async () => { pending.resolve({ data: [{ id: 7 }] }) })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual({ buyers: [{ id: 1, name: "Buyer" }], orders: [{ id: 7 }] })
  })

  it("preserves a genuine empty result without inventing demo records", async () => {
    list.mockResolvedValue({ data: [] })
    const { result } = renderHook(() => useModuleRows(buyers))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual({ buyers: [] })
    expect(result.current.error).toBeNull()
  })

  it("does not let an old request overwrite a newer source selection", async () => {
    const old = deferred()
    list.mockReturnValueOnce(old.promise)
    list.mockResolvedValueOnce({ data: [{ id: 9 }] })
    const { result, rerender } = renderHook(({ sources }) => useModuleRows(sources), {
      initialProps: { sources: buyers },
    })
    rerender({ sources: [{ key: "stock", app: "inventory", model: "Fabric" }] })
    await waitFor(() => expect(result.current.data).toEqual({ stock: [{ id: 9 }] }))
    await act(async () => { old.resolve({ data: [{ id: 1 }] }) })
    expect(result.current.data).toEqual({ stock: [{ id: 9 }] })
  })

  it("does not refetch equivalent source definitions on every render", async () => {
    list.mockResolvedValue({ data: [{ id: 1 }] })
    const { result, rerender } = renderHook(() => useModuleRows(buyers.map((source) => ({ ...source }))))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    rerender()
    expect(list).toHaveBeenCalledTimes(1)
  })
})
