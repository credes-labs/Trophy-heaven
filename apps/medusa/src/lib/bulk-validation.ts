/**
 * Server-side re-validation of uploaded bulk-order rows (API 05.2). The client
 * parses the spreadsheet with SheetJS for preview, but the server re-parses and
 * re-validates so trust never rests on the client.
 */
export type RawBulkRow = {
  name?: unknown
  designation?: unknown
  award_category?: unknown
}

export type ValidatedLine = {
  row_number: number
  name: string
  designation: string | null
  award_category: string | null
  validation_errors: { field: string; issue: string }[]
}

const MAX_NAME = 80
const MAX_DESIGNATION = 80
const MAX_CATEGORY = 60
export const MAX_BULK_ROWS = 5000

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim()
}

export function validateBulkRows(rows: RawBulkRow[]): {
  lines: ValidatedLine[]
  errors: { row: number; field: string; issue: string }[]
  total: number
  valid: number
  invalid: number
} {
  const seen = new Map<string, number>()
  const lines: ValidatedLine[] = []
  const errors: { row: number; field: string; issue: string }[] = []

  rows.forEach((raw, i) => {
    const rowNumber = i + 1
    const name = str(raw.name)
    const designation = str(raw.designation) || null
    const awardCategory = str(raw.award_category) || null
    const rowErrors: { field: string; issue: string }[] = []

    if (!name) rowErrors.push({ field: "name", issue: "Name is required." })
    if (name.length > MAX_NAME)
      rowErrors.push({ field: "name", issue: `Name exceeds ${MAX_NAME} characters.` })
    if (designation && designation.length > MAX_DESIGNATION)
      rowErrors.push({ field: "designation", issue: `Designation exceeds ${MAX_DESIGNATION} characters.` })
    if (awardCategory && awardCategory.length > MAX_CATEGORY)
      rowErrors.push({ field: "award_category", issue: `Award category exceeds ${MAX_CATEGORY} characters.` })

    // Duplicate name + designation combination.
    const key = `${name.toLowerCase()}|${(designation ?? "").toLowerCase()}`
    if (name) {
      if (seen.has(key)) {
        rowErrors.push({ field: "name", issue: `Duplicate of row ${seen.get(key)}.` })
      } else {
        seen.set(key, rowNumber)
      }
    }

    for (const e of rowErrors) errors.push({ row: rowNumber, ...e })
    lines.push({
      row_number: rowNumber,
      name,
      designation,
      award_category: awardCategory,
      validation_errors: rowErrors,
    })
  })

  const valid = lines.filter((l) => l.validation_errors.length === 0).length
  return { lines, errors, total: lines.length, valid, invalid: lines.length - valid }
}
