import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Text, Textarea, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

type DesignApproval = {
  id: string
  design_id: string
  status: string
  feedback: string | null
}

/** Design approval queue (FR-PROD-2). Reviewers approve or reject with required
 * feedback; rejection routes back to the customer as changes-requested. */
const ApprovalsQueue = () => {
  const [approvals, setApprovals] = useState<DesignApproval[]>([])
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch("/admin/design-approvals?status=pending", { credentials: "include" })
    const body = await res.json()
    setApprovals(body.design_approvals ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function approve(id: string) {
    await fetch(`/admin/design-approvals/${id}/approve`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    load()
  }

  async function reject(id: string) {
    const fb = feedback[id]?.trim()
    if (!fb) return
    await fetch(`/admin/design-approvals/${id}/reject`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback: fb }),
    })
    load()
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Design approvals</Heading>
        <Button variant="secondary" size="small" onClick={load}>
          Refresh
        </Button>
      </div>
      {loading ? (
        <Text className="px-6 py-4 text-ui-fg-subtle">Loading…</Text>
      ) : approvals.length === 0 ? (
        <Text className="px-6 py-4 text-ui-fg-subtle">No designs awaiting review.</Text>
      ) : (
        <div className="space-y-4 px-6 py-4">
          {approvals.map((a) => (
            <div key={a.id} className="rounded-lg border border-ui-border-base p-4">
              <div className="flex items-center justify-between">
                <Text weight="plus">Design {a.design_id}</Text>
                <Badge size="2xsmall">{a.status}</Badge>
              </div>
              <Textarea
                className="mt-3"
                placeholder="Feedback (required to reject)"
                value={feedback[a.id] ?? ""}
                onChange={(e) => setFeedback((f) => ({ ...f, [a.id]: e.target.value }))}
              />
              <div className="mt-3 flex gap-2">
                <Button size="small" variant="primary" onClick={() => approve(a.id)}>
                  Approve
                </Button>
                <Button
                  size="small"
                  variant="danger"
                  onClick={() => reject(a.id)}
                  disabled={!feedback[a.id]?.trim()}
                >
                  Reject with feedback
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Design approvals",
})

export default ApprovalsQueue
