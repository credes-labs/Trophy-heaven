"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { useCartStore } from "@/stores/cart-store"

/**
 * Client providers: TanStack Query for server-state on interactive surfaces
 * (cart, account, designs) and cart bootstrap on first mount.
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

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
