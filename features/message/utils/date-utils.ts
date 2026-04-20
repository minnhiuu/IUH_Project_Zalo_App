/**
 * Normalize datetime string while preserving intended local clock time.
 * - Keep explicit timezone formats as-is.
 * - Convert +0700 / -0500 to +07:00 / -05:00.
 * - Do NOT append Z for timezone-less values to avoid shifting sent time.
 */
export function normalizeDateTime(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  if (/Z$|[+-]\d{2}:\d{2}$/.test(value)) return value

  // Handle offsets serialized as +0700 / -0500 by converting to +07:00 / -05:00.
  if (/[+-]\d{4}$/.test(value)) {
    return value.replace(/([+-]\d{2})(\d{2})$/, '$1:$2')
  }

  return value
}

export function parseMessageDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined) return null

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'number') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  }

  const normalized = normalizeDateTime(value)
  if (!normalized) return null

  // Explicit timezone: parse natively.
  if (/Z$|[+-]\d{2}:\d{2}$/.test(normalized)) {
    const date = new Date(normalized)
    return isNaN(date.getTime()) ? null : date
  }

  // No timezone: treat as local time to preserve exact sent hour/minute.
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/
  )

  if (match) {
    const msRaw = match[7] || '0'
    const ms = parseInt(msRaw.padEnd(3, '0'), 10)
    const date = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
      Number(match[6] || '0'),
      ms
    )
    return isNaN(date.getTime()) ? null : date
  }

  const fallback = new Date(normalized)
  return isNaN(fallback.getTime()) ? null : fallback
}
