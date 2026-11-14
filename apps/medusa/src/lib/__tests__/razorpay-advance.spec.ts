import RazorpayProviderService from "../../modules/razorpay/service"

const logger = { warn: jest.fn(), info: jest.fn(), error: jest.fn() } as never

function service() {
  return new RazorpayProviderService({ logger }, { key_id: "rzp_test_x", key_secret: "secret" })
}

describe("Razorpay initiatePayment payment plans", () => {
  const realFetch = global.fetch
  let sent: Record<string, unknown> | null

  beforeEach(() => {
    sent = null
    global.fetch = jest.fn(async (_url: unknown, init?: { body?: string }) => {
      sent = JSON.parse(init?.body ?? "{}")
      return { ok: true, json: async () => ({ id: "order_1", status: "created" }) } as Response
    }) as never
  })

  afterAll(() => {
    global.fetch = realFetch
  })

  it("charges the full total by default", async () => {
    const res = await service().initiatePayment({ amount: 40899, currency_code: "inr" })
    expect(sent?.amount).toBe(4_089_900)
    expect(res.data).toMatchObject({ amount_paise: 4_089_900, payment_plan: "full" })
  })

  it("charges only the 10% advance for advance_cod and records the COD balance", async () => {
    const res = await service().initiatePayment({
      amount: 40899,
      currency_code: "inr",
      data: { payment_plan: "advance_cod" },
    })
    expect(sent?.amount).toBe(408_990)
    expect(res.data).toMatchObject({
      amount_paise: 408_990,
      total_paise: 4_089_900,
      advance_paise: 408_990,
      cod_due_paise: 3_680_910,
      payment_plan: "advance_cod",
    })
  })

  it("ignores unknown plans from the client", async () => {
    await service().initiatePayment({
      amount: 1000,
      currency_code: "inr",
      data: { payment_plan: "pay_one_rupee" },
    })
    expect(sent?.amount).toBe(100_000)
  })
})
