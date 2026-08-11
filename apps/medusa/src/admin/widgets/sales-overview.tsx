import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"

/**
 * Sales overview widget on the admin dashboard (FR-ADM-1). Full analytics
 * (revenue, AOV, conversion, top products) are computed by an admin analytics
 * route; this widget surfaces the headline figures. Data wiring lands alongside
 * the analytics endpoint — the widget renders the placeholder shell for now.
 */
const SalesOverviewWidget = () => {
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Sales overview</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Legacy Crafts
        </Text>
      </div>
      <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-cols-4">
        {[
          { label: "Revenue", value: "—" },
          { label: "Orders", value: "—" },
          { label: "AOV", value: "—" },
          { label: "Conversion", value: "—" },
        ].map((kpi) => (
          <div key={kpi.label}>
            <Text size="small" className="text-ui-fg-subtle">
              {kpi.label}
            </Text>
            <Heading level="h3">{kpi.value}</Heading>
          </div>
        ))}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default SalesOverviewWidget
