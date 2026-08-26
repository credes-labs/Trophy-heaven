import { roleFromAuthContext } from "../rbac"

describe("roleFromAuthContext", () => {
  it("denies missing actor instead of defaulting to admin", () => {
    expect(roleFromAuthContext(undefined)).toBeNull()
    expect(roleFromAuthContext({})).toBeNull()
    expect(roleFromAuthContext({ actor_id: "cus_1", actor_type: "customer" })).toBeNull()
  })

  it("honors an explicit staff role", () => {
    expect(
      roleFromAuthContext({
        actor_id: "user_1",
        actor_type: "user",
        app_metadata: { role: "designer" },
      })
    ).toBe("designer")
  })

  it("treats Medusa dashboard users without LC role as admin", () => {
    expect(roleFromAuthContext({ actor_id: "user_1", actor_type: "user" })).toBe("admin")
  })
})
