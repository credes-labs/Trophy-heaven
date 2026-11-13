import { describe, expect, it, vi } from "vitest"
import { genRandomNumbers, hexToRgb } from "./globe"

// These tests exercise the exported pure helpers, without initializing a renderer.
vi.mock("@react-three/fiber", () => ({ extend: vi.fn(), Canvas: vi.fn(), useThree: vi.fn() }))
vi.mock("@react-three/drei", () => ({ OrbitControls: vi.fn() }))
vi.mock("three-globe", () => ({ default: vi.fn() }))

describe("globe helpers", () => {
  it("accepts shorthand and full RGB colors and rejects malformed colors", () => {
    expect(hexToRgb("#fc0")).toEqual({ r: 255, g: 204, b: 0 })
    expect(hexToRgb("B89E6B")).toEqual({ r: 184, g: 158, b: 107 })
    expect(hexToRgb("not-a-color")).toBeNull()
  })

  it("returns unique bounded indices and terminates for excessive ring counts", () => {
    const indices = genRandomNumbers(0, 40, 32)
    expect(indices).toHaveLength(32)
    expect(new Set(indices).size).toBe(32)
    expect(indices.every((i) => i >= 0 && i < 40)).toBe(true)
    expect(genRandomNumbers(0, 3, 100).sort()).toEqual([0, 1, 2])
    expect(genRandomNumbers(3, 3, 5)).toEqual([])
    expect(genRandomNumbers(0, 3, Infinity)).toEqual([])
  })
})
