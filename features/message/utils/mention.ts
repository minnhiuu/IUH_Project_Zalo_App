export const MENTION_REGEX = /(@<mention>.*?<\/mention>)/g

/**
 * Strips HTML mention tags to plain text.
 * Useful for previews like Sidebar, Notifications, Pinboard snapshot preview, etc.
 * Example: "Hello @<mention>Minh</mention>" -> "Hello @Minh"
 */
export function stripMentionsForPreview(content: string | undefined | null): string {
  if (!content) return ''
  return content.replace(/@<mention>(.*?)<\/mention>/g, '@$1')
}

/**
 * Parses content into parts for React rendering.
 * Returns an array of objects to map over in JSX.
 */
export function parseMentionsForRender(content: string | undefined | null) {
  if (!content) return []
  return content.split(MENTION_REGEX).map((part, i) => {
    if (part.startsWith('@<mention>') && part.endsWith('</mention>')) {
      const name = part.slice(10, -10).trim()
      return { isMention: true, text: `@${name}`, key: i }
    }
    return { isMention: false, text: part, key: i }
  })
}
