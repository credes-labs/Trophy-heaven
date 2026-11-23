import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Container, Heading, Text } from "@medusajs/ui"
import { ORDER_DESIGN_NOTES_KEY, collectOrderFiles } from "../../lib/order-files"

/** The customer's designs and documents on an order, with the trophy each one belongs to. */
const OrderCustomerFilesWidget = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const files = collectOrderFiles(order.metadata, order.items ?? [])
  const notes = order.metadata?.[ORDER_DESIGN_NOTES_KEY]

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Customer files</Heading>
      </div>
      {files.length === 0 ? (
        <Text size="small" className="text-ui-fg-subtle px-6 py-4">
          No files attached.
        </Text>
      ) : (
        <ul className="divide-y">
          {files.map((file, index) => (
            <li key={`${file.url}-${index}`} className="px-6 py-3">
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="text-ui-fg-interactive txt-compact-small-plus break-all hover:underline"
              >
                {file.filename}
              </a>
              <Text size="small" className="text-ui-fg-subtle">
                {file.scope}
              </Text>
            </li>
          ))}
        </ul>
      )}
      {typeof notes === "string" && notes ? (
        <div className="px-6 py-4">
          <Text size="small" weight="plus">
            Design notes
          </Text>
          <Text size="small" className="text-ui-fg-subtle whitespace-pre-wrap">
            {notes}
          </Text>
        </div>
      ) : null}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default OrderCustomerFilesWidget
