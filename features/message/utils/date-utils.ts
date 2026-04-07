/**
 * Java LocalDateTime serializes without timezone: "2026-03-28T13:21:27"
 * → new Date() returns Invalid Date on some platforms. Append "Z" to treat as UTC.
 */
export function normalizeDateTime(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  if (/Z$|[+-]\d{2}:\d{2}$/.test(value)) return value
  return value + 'Z'
}
