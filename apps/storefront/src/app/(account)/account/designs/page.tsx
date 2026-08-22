"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { designApi, type DesignRecord } from "@/lib/design-client"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type Tab = "all" | "2d" | "3d"

export default function DesignsPage() {
  const [designs, setDesigns] = useState<DesignRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("all")
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { designs: list } = await designApi.list()
        if (!cancelled) setDesigns(list ?? [])
      } catch {
        if (!cancelled) setDesigns([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (tab === "all") return designs
    return designs.filter((d) => d.mode === tab)
  }, [designs, tab])

  async function handleClone(id: string) {
    setBusyId(id)
    try {
      const { design } = await designApi.clone(id)
      setDesigns((prev) => [design, ...prev])
    } catch {
      // ignore
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            My designs
            {!loading && designs.length > 0 ? (
              <span className="ml-2 text-lg font-normal text-muted-foreground">
                ({designs.length})
              </span>
            ) : null}
          </h1>
          <p className="mt-1 text-muted-foreground">Saved 2D and 3D customizations.</p>
        </div>
        <Link href="/shop" className={cn(buttonVariants({ size: "sm" }))}>
          + New design
        </Link>
      </header>

      <TabsRoot value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="2d">2D</TabsTrigger>
          <TabsTrigger value="3d">3D</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-start gap-4 py-12">
                <p className="text-muted-foreground">
                  No designs yet. Open a customizable product and save your work.
                </p>
                <Link href="/shop" className={cn(buttonVariants())}>
                  Browse shop
                </Link>
              </CardContent>
            </Card>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((design) => (
                <li key={design.id}>
                  <Card className="overflow-hidden">
                    <div className="aspect-[4/3] bg-muted">
                      {design.preview_url ? (
                        // Raw <img> used intentionally (dynamic backend URLs; Next/Image domain config not required here).
                        <img
                          src={design.preview_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                          No preview
                        </div>
                      )}
                    </div>
                    <CardContent className="space-y-3 p-4">
                      <div>
                        <p className="truncate font-medium">{design.name}</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <Badge variant="outline">{design.mode.toUpperCase()}</Badge>
                          <Badge variant="default">{design.status}</Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/customize/${design.product_id}/${design.mode}?design=${design.id}`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Open
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={busyId === design.id}
                          onClick={() => void handleClone(design.id)}
                        >
                          Clone
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </TabsRoot>
    </div>
  )
}
