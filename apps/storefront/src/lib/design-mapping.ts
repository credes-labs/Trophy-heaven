import {
  LINE_DESIGN_KEY,
  LINE_DESIGN_PIECES_KEY,
  ORDER_DESIGNS_MAX,
  readDesignFile,
  readOrderDocuments,
  type DesignFile,
} from "./design-uploads"

/**
 * Rules for matching uploaded designs to the trophies in a cart. Mirrored server-side in
 * apps/medusa/src/lib/order-files.ts (`checkOrderDesigns`), which blocks cart completion.
 *
 * - A "piece" is one physical trophy: a line with quantity 3 has three.
 * - Images are designs: never more of them than pieces, and each must be on a piece.
 * - PDFs and office files are whole-order documents: no limit from pieces, no mapping.
 */
export type CartLineLike = {
  id: string
  quantity?: number | null
  title?: string | null
  product_title?: string | null
  variant_title?: string | null
  thumbnail?: string | null
  metadata?: Record<string, unknown> | null
}

/** Design per piece for one line, indexed by piece; `null` = no design on that piece. */
export type LinePieces = (DesignFile | null)[]
export type PieceMap = Record<string, LinePieces>

const IMAGE_EXTENSION = /\.(png|jpe?g|webp)$/i

/** Mappable artwork. A PDF may hold many designs, so it stays a whole-order document. */
export function isMappableDesign(file: { filename?: string; name?: string; mime_type?: string }) {
  if (file.mime_type?.startsWith("image/")) return true
  return IMAGE_EXTENSION.test(file.filename ?? file.name ?? "")
}

/** Medusa may return lines in any order after an update; ids are time-sorted and stable. */
export function stableLines<T extends { id: string }>(lines: T[]): T[] {
  return [...lines].sort((a, b) => a.id.localeCompare(b.id))
}

function quantityOf(line: CartLineLike): number {
  return Math.max(0, Number(line.quantity ?? 0))
}

export function pieceCount(lines: CartLineLike[]): number {
  return lines.reduce((sum, line) => sum + quantityOf(line), 0)
}

/**
 * The design on each piece. An explicit `design_pieces` list wins; otherwise an image
 * attached to the line (product page, cart line) covers every piece of that line.
 */
export function readLinePieces(line: CartLineLike): LinePieces {
  const quantity = quantityOf(line)
  const stored = line.metadata?.[LINE_DESIGN_PIECES_KEY]
  if (Array.isArray(stored)) {
    return Array.from({ length: quantity }, (_, i) => {
      const file = readDesignFile(stored[i])
      return file && isMappableDesign(file) ? file : null
    })
  }
  const lineFile = readDesignFile(line.metadata?.[LINE_DESIGN_KEY])
  const design = lineFile && isMappableDesign(lineFile) ? lineFile : null
  return Array.from({ length: quantity }, () => design)
}

/**
 * Metadata form of a line's pieces. Medusa's line-item update crashes on `null` inside a
 * metadata array, so an empty piece is stored as `{}` (read back as no design).
 */
export function toStoredPieces(pieces: LinePieces): (DesignFile | Record<string, never>)[] {
  return pieces.map((file) => file ?? {})
}

export type CartDesignState = {
  pieces: number
  /** Most designs this cart may hold. */
  limit: number
  designs: DesignFile[]
  documents: DesignFile[]
  /** Designs not on any piece. */
  unassigned: DesignFile[]
  /** Designs beyond the limit, e.g. after a quantity was reduced. */
  overBy: number
  /** Pieces with no design. Allowed: not every trophy needs artwork. */
  emptyPieces: number
  room: number
  /** Checkout must wait until this is resolved. */
  needsAction: boolean
  /** Why, in the customer's words; null when nothing is wrong. */
  problem: string | null
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`
}

export function cartDesignState(
  metadata: Record<string, unknown> | null | undefined,
  lines: CartLineLike[]
): CartDesignState {
  const pool = readOrderDocuments(metadata)
  const documents = pool.filter((f) => !isMappableDesign(f))
  const byUrl = new Map<string, DesignFile>()
  for (const file of pool) if (isMappableDesign(file)) byUrl.set(file.url, file)

  const used = new Set<string>()
  let emptyPieces = 0
  for (const line of lines) {
    for (const file of readLinePieces(line)) {
      if (!file) {
        emptyPieces += 1
        continue
      }
      used.add(file.url)
      if (!byUrl.has(file.url)) byUrl.set(file.url, file)
    }
  }

  const designs = [...byUrl.values()]
  const pieces = pieceCount(lines)
  const limit = Math.min(pieces, ORDER_DESIGNS_MAX)
  const unassigned = designs.filter((f) => !used.has(f.url))
  const overBy = Math.max(0, designs.length - limit)

  let problem: string | null = null
  if (overBy > 0) {
    problem = `You have ${plural(designs.length, "design")} for ${pieces} ${pieces === 1 ? "trophy" : "trophies"}. Remove ${overBy} to continue.`
  } else if (unassigned.length > 0) {
    problem = `${plural(unassigned.length, "design")} ${unassigned.length === 1 ? "is" : "are"} not matched to a trophy yet.`
  }

  return {
    pieces,
    limit,
    designs,
    documents,
    unassigned,
    overBy,
    emptyPieces,
    room: Math.max(0, limit - designs.length),
    needsAction: problem !== null,
    problem,
  }
}

/** Splits a picked batch against the room left, so nothing over the limit is uploaded. */
export function partitionUploads<T extends { name: string; type?: string }>(
  files: T[],
  designRoom: number,
  documentRoom: number
): { accepted: T[]; rejectedDesigns: number; rejectedDocuments: number } {
  const accepted: T[] = []
  let designs = 0
  let documents = 0
  let rejectedDesigns = 0
  let rejectedDocuments = 0
  for (const file of files) {
    if (isMappableDesign({ name: file.name, mime_type: file.type })) {
      if (designs < designRoom) {
        designs += 1
        accepted.push(file)
      } else rejectedDesigns += 1
    } else if (documents < documentRoom) {
      documents += 1
      accepted.push(file)
    } else rejectedDocuments += 1
  }
  return { accepted, rejectedDesigns, rejectedDocuments }
}

/**
 * First guess at the mapping, keeping what the customer already chose. One design goes
 * on every piece; otherwise each unused design takes the first empty piece, then the
 * last piece of a design that is on several.
 */
export function suggestPieces(unordered: CartLineLike[], designs: DesignFile[]): PieceMap {
  const lines = stableLines(unordered)
  const known = new Set(designs.map((d) => d.url))
  const map: PieceMap = {}
  for (const line of lines) {
    map[line.id] = readLinePieces(line).map((f) => (f && known.has(f.url) ? f : null))
  }

  const slots = lines.flatMap((line) => map[line.id].map((_, piece) => ({ lineId: line.id, piece })))
  if (designs.length === 1) {
    for (const { lineId, piece } of slots) map[lineId][piece] ??= designs[0]
    return map
  }

  const counts = new Map<string, number>()
  for (const { lineId, piece } of slots) {
    const url = map[lineId][piece]?.url
    if (url) counts.set(url, (counts.get(url) ?? 0) + 1)
  }

  for (const design of designs) {
    if (counts.get(design.url)) continue
    const target =
      slots.find(({ lineId, piece }) => !map[lineId][piece]) ??
      [...slots].reverse().find(({ lineId, piece }) => {
        const url = map[lineId][piece]?.url
        return Boolean(url && (counts.get(url) ?? 0) > 1)
      })
    if (!target) break
    const previous = map[target.lineId][target.piece]?.url
    if (previous) counts.set(previous, (counts.get(previous) ?? 1) - 1)
    map[target.lineId][target.piece] = design
    counts.set(design.url, 1)
  }
  return map
}

/** Moves unused designs onto empty pieces, e.g. after another design was removed. */
export function fillEmptyPieces(map: PieceMap, designs: DesignFile[]): PieceMap {
  const next: PieceMap = Object.fromEntries(Object.entries(map).map(([id, p]) => [id, [...p]]))
  const waiting = unusedDesigns(next, designs)
  for (const pieces of Object.values(next)) {
    for (let i = 0; i < pieces.length && waiting.length; i++) {
      if (!pieces[i]) pieces[i] = waiting.shift() ?? null
    }
  }
  return next
}

/** Which designs a draft mapping leaves unused (drives the dialog's save button). */
export function unusedDesigns(map: PieceMap, designs: DesignFile[]): DesignFile[] {
  const used = new Set(
    Object.values(map)
      .flat()
      .map((f) => f?.url)
  )
  return designs.filter((d) => !used.has(d.url))
}
