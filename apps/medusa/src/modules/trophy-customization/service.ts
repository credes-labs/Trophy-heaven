import { MedusaService } from "@medusajs/framework/utils"
import crypto from "node:crypto"
import { Design } from "./models/design"
import { DesignPreset } from "./models/design-preset"
import { DesignRevision } from "./models/design-revision"

/**
 * DesignService — CRUD for designs/presets/revisions plus clone + share
 * (FR-DESIGN-2/3/6/7, API 05.1). MedusaService generates list/create/update/
 * delete/retrieve for each model; custom methods below add domain behavior.
 */
class DesignService extends MedusaService({
  Design,
  DesignPreset,
  DesignRevision,
}) {
  /** Snapshot the current state into a revision before an update (API 05.1 PUT). */
  async snapshotRevision(designId: string, createdBy: string | null) {
    const design = await this.retrieveDesign(designId)
    const existing = await this.listDesignRevisions(
      { design_id: designId },
      { order: { revision_number: "DESC" }, take: 1 }
    )
    const nextNumber = (existing[0]?.revision_number ?? 0) + 1
    return this.createDesignRevisions({
      design_id: designId,
      state_json: design.state_json,
      revision_number: nextNumber,
      created_by: createdBy,
    })
  }

  /** Clone a design or preset into a new draft owned by the customer. */
  async cloneDesign(input: {
    sourceId: string
    fromPreset?: boolean
    customerId: string | null
    ownerToken?: string | null
    name?: string
  }) {
    if (input.fromPreset) {
      const preset = await this.retrieveDesignPreset(input.sourceId)
      return this.createDesigns({
        customer_id: input.customerId,
        owner_token: input.ownerToken ?? null,
        name: input.name ?? `${preset.name} (copy)`,
        mode: preset.mode === "both" ? "2d" : preset.mode,
        product_id: preset.base_product_id,
        variant_id: null,
        state_json: preset.default_state_json,
        preview_url: preset.preview_url,
        is_template: false,
        status: "draft",
      })
    }
    const source = await this.retrieveDesign(input.sourceId)
    return this.createDesigns({
      customer_id: input.customerId,
      owner_token: input.ownerToken ?? null,
      name: input.name ?? `${source.name} (copy)`,
      mode: source.mode,
      product_id: source.product_id,
      variant_id: source.variant_id,
      state_json: source.state_json,
      preview_url: source.preview_url,
      is_template: false,
      status: "draft",
    })
  }

  /** Generate (or return) a view-only share token for a design. */
  async generateShareToken(designId: string) {
    const token = crypto.randomBytes(24).toString("base64url")
    await this.updateDesigns({ id: designId, share_token: token })
    return token
  }

  async revokeShareToken(designId: string) {
    await this.updateDesigns({ id: designId, share_token: null })
  }
}

export default DesignService
