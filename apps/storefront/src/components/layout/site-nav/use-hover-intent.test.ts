import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { HOVER_CLOSE_DELAY_MS, HOVER_OPEN_DELAY_MS, useHoverIntent } from "./use-hover-intent"

describe("useHoverIntent", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("opens only after the open delay", () => {
    const { result } = renderHook(() => useHoverIntent())
    act(() => result.current.pointerEnter("shop"))
    act(() => vi.advanceTimersByTime(HOVER_OPEN_DELAY_MS - 1))
    expect(result.current.openId).toBeNull()
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.openId).toBe("shop")
  })

  it("does not open when the pointer sweeps past", () => {
    const { result } = renderHook(() => useHoverIntent())
    act(() => result.current.pointerEnter("shop"))
    act(() => result.current.pointerLeave())
    act(() => vi.advanceTimersByTime(HOVER_CLOSE_DELAY_MS * 2))
    expect(result.current.openId).toBeNull()
  })

  it("keeps the menu open when the pointer returns before the close delay", () => {
    const { result } = renderHook(() => useHoverIntent())
    act(() => result.current.open("info"))
    act(() => result.current.pointerLeave())
    act(() => vi.advanceTimersByTime(HOVER_CLOSE_DELAY_MS - 50))
    act(() => result.current.pointerEnter("info"))
    act(() => vi.advanceTimersByTime(HOVER_CLOSE_DELAY_MS * 2))
    expect(result.current.openId).toBe("info")
  })

  it("closes after the close delay", () => {
    const { result } = renderHook(() => useHoverIntent())
    act(() => result.current.open("info"))
    act(() => result.current.pointerLeave())
    act(() => vi.advanceTimersByTime(HOVER_CLOSE_DELAY_MS))
    expect(result.current.openId).toBeNull()
  })

  it("swaps instantly between adjacent triggers while one is open", () => {
    const { result } = renderHook(() => useHoverIntent())
    act(() => result.current.open("news"))
    act(() => result.current.pointerLeave())
    act(() => result.current.pointerEnter("contact"))
    expect(result.current.openId).toBe("contact")
  })

  it("clears pending timers on unmount", () => {
    const { result, unmount } = renderHook(() => useHoverIntent())
    act(() => result.current.pointerEnter("shop"))
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
