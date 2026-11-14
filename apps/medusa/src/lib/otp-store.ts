import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { OTP_TTL_SECONDS, otpCacheKey } from "./otp"

export type OtpRecord = { hash: string; attempts: number; sentAt: number }

type CacheService = {
  get<T>(key: string): Promise<T | null>
  set(key: string, data: unknown, ttl?: number): Promise<void>
  invalidate(key: string): Promise<void>
}

/** OTP records live in the Redis-backed cache module with the code's TTL. */
export function otpStore(container: MedusaContainer) {
  const cache = container.resolve<CacheService>(Modules.CACHE)
  return {
    get: (identifier: string) => cache.get<OtpRecord>(otpCacheKey(identifier)),
    set: (identifier: string, record: OtpRecord, ttl = OTP_TTL_SECONDS) =>
      cache.set(otpCacheKey(identifier), record, ttl),
    clear: (identifier: string) => cache.invalidate(otpCacheKey(identifier)),
  }
}

export function otpPepper(container: MedusaContainer): string {
  const config = container.resolve(ContainerRegistrationKeys.CONFIG_MODULE)
  return String(config.projectConfig.http.jwtSecret ?? "supersecret")
}
