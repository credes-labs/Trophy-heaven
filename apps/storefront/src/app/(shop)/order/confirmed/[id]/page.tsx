import type { Metadata } from "next"
import { OrderConfirmedClient } from "./order-confirmed-client"

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
}

type Props = { params: Promise<{ id: string }> }

export default async function OrderConfirmedPage({ params }: Props) {
  const { id } = await params
  return <OrderConfirmedClient id={id} />
}
