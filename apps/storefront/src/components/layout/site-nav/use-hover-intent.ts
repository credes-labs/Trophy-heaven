"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export const HOVER_OPEN_DELAY_MS = 100
export const HOVER_CLOSE_DELAY_MS = 300

/**
 * Which flyout is open, with hover intent: a short open delay so sweeping across the bar
 * doesn't flash menus, a close delay that re-entry cancels, and instant swaps while one is open.
 */
export function useHoverIntent({
  openDelay = HOVER_OPEN_DELAY_MS,
  closeDelay = HOVER_CLOSE_DELAY_MS,
}: { openDelay?: number; closeDelay?: number } = {}) {
  const [openId, setOpenIdState] = useState<string | null>(null)
  const openIdRef = useRef<string | null>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    openTimer.current = null
    closeTimer.current = null
  }, [])

  const setOpenId = useCallback((id: string | null) => {
    openIdRef.current = id
    setOpenIdState(id)
  }, [])

  const open = useCallback(
    (id: string) => {
      clearTimers()
      setOpenId(id)
    },
    [clearTimers, setOpenId],
  )

  const close = useCallback(() => {
    clearTimers()
    setOpenId(null)
  }, [clearTimers, setOpenId])

  const pointerEnter = useCallback(
    (id: string) => {
      clearTimers()
      if (openIdRef.current !== null) {
        setOpenId(id)
        return
      }
      openTimer.current = setTimeout(() => {
        openTimer.current = null
        setOpenId(id)
      }, openDelay)
    },
    [clearTimers, setOpenId, openDelay],
  )

  const pointerLeave = useCallback(() => {
    clearTimers()
    if (openIdRef.current === null) return
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null
      setOpenId(null)
    }, closeDelay)
  }, [clearTimers, setOpenId, closeDelay])

  useEffect(() => clearTimers, [clearTimers])

  return { openId, open, close, pointerEnter, pointerLeave }
}
