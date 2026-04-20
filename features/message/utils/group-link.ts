export const GROUP_LINK_PREFIX = '[GROUP_LINK]'
const DEFAULT_WEB_ORIGIN = 'http://localhost:5173'

function normalizeWebOrigin(origin?: string | null): string {
  const source = (origin || '').trim() || DEFAULT_WEB_ORIGIN
  return source.replace(/\/+$/, '')
}

export function getGroupLinkWebOrigin(): string {
  return normalizeWebOrigin(process.env.EXPO_PUBLIC_WEB_URL)
}

export function buildGroupLinkUrl(token: string): string {
  const cleanToken = String(token || '').trim()
  if (!cleanToken) return ''
  return `${getGroupLinkWebOrigin()}/g/${cleanToken}`
}

export type GroupLinkPayload = {
  url: string
  groupName?: string
  groupAvatar?: string | null
}

export function serializeGroupLinkContent(payload: GroupLinkPayload): string {
  // Keep newline after prefix to stay compatible with web payload shape.
  return `${GROUP_LINK_PREFIX}\n${JSON.stringify(payload)}`
}

export function parseGroupLinkContent(raw?: string | null): GroupLinkPayload | null {
  if (!raw || typeof raw !== 'string') return null

  const content = raw.trim()

  if (content.includes(GROUP_LINK_PREFIX)) {
    const start = content.indexOf(GROUP_LINK_PREFIX)
    const afterPrefix = content.slice(start + GROUP_LINK_PREFIX.length).trim()
    try {
      const parsed = JSON.parse(afterPrefix) as Record<string, unknown>
      const rawUrl = parsed?.url ?? parsed?.link ?? parsed?.inviteLink
      if (!rawUrl) return null
      return {
        url: String(rawUrl),
        groupName:
          (typeof parsed.groupName === 'string' && parsed.groupName.trim()) ||
          (typeof parsed.name === 'string' && parsed.name.trim()) ||
          undefined,
        groupAvatar:
          (typeof parsed.groupAvatar === 'string' && parsed.groupAvatar) ||
          (typeof parsed.avatar === 'string' && parsed.avatar) ||
          null
      }
    } catch {
      return null
    }
  }

  const match = content.match(/(?:(?:https?:\/\/)?[^\s/]+)?\/g\/([A-Za-z0-9]+)/i)
  if (!match) return null

  const full = match[0]
  const normalizedUrl = full.startsWith('http') ? full : full.startsWith('/g/') ? `${getGroupLinkWebOrigin()}${full}` : `https://${full}`
  return {
    url: normalizedUrl,
    groupName: undefined,
    groupAvatar: null
  }
}

export function parseGroupLinkToken(raw?: string | null): string | null {
  const payload = parseGroupLinkContent(raw)
  if (!payload?.url) return null
  const match = payload.url.match(/\/g\/([A-Za-z0-9]+)/i)
  return match?.[1] || null
}
