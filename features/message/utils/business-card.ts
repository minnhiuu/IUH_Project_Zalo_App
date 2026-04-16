export const BUSINESS_CARD_PREFIX = '[BUSINESS_CARD]::'

export type BusinessCardPayload = {
  userId: string
  name: string
  phone?: string
  avatar?: string | null
  qrValue?: string
}

export function serializeBusinessCard(payload: BusinessCardPayload): string {
  return `${BUSINESS_CARD_PREFIX}${JSON.stringify(payload)}`
}

export function parseBusinessCardContent(content: string | null | undefined): BusinessCardPayload | null {
  if (!content || typeof content !== 'string') return null
  if (!content.startsWith(BUSINESS_CARD_PREFIX)) return null

  try {
    const raw = content.slice(BUSINESS_CARD_PREFIX.length)
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (!parsed.userId || !parsed.name) return null

    return {
      userId: String(parsed.userId),
      name: String(parsed.name),
      phone: parsed.phone ? String(parsed.phone) : '',
      avatar: parsed.avatar ? String(parsed.avatar) : null,
      qrValue: parsed.qrValue ? String(parsed.qrValue) : undefined
    }
  } catch {
    return null
  }
}
