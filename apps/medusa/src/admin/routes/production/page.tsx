import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge, Button, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

type ProductionJob = {
  id: string
  order_id: string
  design_id: string
  status: string
  complexity: string
  material: string
  assigned_workshop: string | null
  tracking_number: string | null
}

const COLUMNS = [
  "pending_design_approval",
  "design_approved",
  "queued",
  "in_production",
  "quality_check",
  "packed",
  "completed",
] as const

/** Mirrors `STATUS_TRANSITIONS` in lib/production-routing (H6). Packed → completed
 * goes through the ship/label action so tracking is always set. */
const NEXT: Record<string, string[]> = {
  pending_design_approval: ["on_hold", "cancelled"],
  design_approved: ["queued", "on_hold", "cancelled"],
  queued: ["in_production", "on_hold", "cancelled"],
  in_production: ["quality_check", "on_hold", "cancelled"],
  quality_check: ["packed", "in_production", "on_hold", "cancelled"],
  packed: ["on_hold"],
  completed: [],
  on_hold: ["pending_design_approval", "design_approved", "queued", "cancelled"],
  cancelled: [],
}

/** Production queue board (FR-PROD-4). Groups jobs by status; managers advance
 * jobs and trigger shipping label creation on packed jobs. */
const ProductionBoard = () => {
  const [jobs, setJobs] = useState<ProductionJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/admin/production-jobs?limit=200", { credentials: "include" })
      const body = await res.json()
      setJobs(body.production_jobs ?? [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function transition(job: ProductionJob, status: string) {
    await fetch(`/admin/production-jobs/${job.id}/status`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function ship(job: ProductionJob) {
    await fetch(`/admin/production-jobs/${job.id}/ship`, { method: "POST", credentials: "include" })
    load()
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Production board</Heading>
        <Button variant="secondary" size="small" onClick={load}>
          Refresh
        </Button>
      </div>
      {error && <Text className="px-6 text-ui-fg-error">{error}</Text>}
      {loading ? (
        <Text className="px-6 py-4 text-ui-fg-subtle">Loading jobs…</Text>
      ) : (
        <div className="flex gap-4 overflow-x-auto px-6 py-4">
          {COLUMNS.map((col) => {
            const colJobs = jobs.filter((j) => j.status === col)
            return (
              <div key={col} className="min-w-[240px] flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <Text size="small" weight="plus">
                    {col.replace(/_/g, " ")}
                  </Text>
                  <Badge size="2xsmall">{colJobs.length}</Badge>
                </div>
                <div className="space-y-2">
                  {colJobs.map((job) => (
                    <div key={job.id} className="rounded-lg border border-ui-border-base p-3">
                      <Text size="small" weight="plus">
                        {job.design_id}
                      </Text>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge size="2xsmall">{job.complexity}</Badge>
                        <Badge size="2xsmall">{job.material}</Badge>
                        {job.assigned_workshop && <Badge size="2xsmall">{job.assigned_workshop}</Badge>}
                      </div>
                      {job.tracking_number && (
                        <Text size="xsmall" className="mt-1 text-ui-fg-subtle">
                          {job.tracking_number}
                        </Text>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(NEXT[job.status] ?? []).map((next) => (
                          <Button
                            key={next}
                            size="small"
                            variant="secondary"
                            onClick={() => transition(job, next)}
                          >
                            → {next.replace(/_/g, " ")}
                          </Button>
                        ))}
                        {job.status === "packed" && (
                          <Button size="small" variant="primary" onClick={() => ship(job)}>
                            Create label
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Production",
})

export default ProductionBoard
