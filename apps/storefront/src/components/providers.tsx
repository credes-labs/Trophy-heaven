"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MotionConfig } from "motion/react"
import { useState, useEffect } from "react"
import { useCartStore } from "@/stores/cart-store"

/**
 * Client providers: TanStack Query for server-state on interactive surfaces
 * (cart, account, designs) and cart bootstrap on first mount.
 * MotionConfig reducedMotion="user" honors prefers-reduced-motion.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
      })
  )
  const initCart = useCartStore((s) => s.init)

  useEffect(() => {
    void initCart()
  }, [initCart])

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </QueryClientProvider>
  )
}
