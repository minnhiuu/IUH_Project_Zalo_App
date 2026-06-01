/** Tách <suggestions>Q1|Q2</suggestions> ra khỏi content. */
export function parseAiSuggestions(raw: string): { cleanContent: string; suggestions: string[] } {
  if (!raw) return { cleanContent: '', suggestions: [] }
  const match = raw.match(/<suggestions>(.*?)<\/suggestions>/is)
  if (!match) return { cleanContent: raw.trim(), suggestions: [] }
  const suggestions = match[1]
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
  const cleanContent = raw.replace(/<suggestions>.*?<\/suggestions>/gis, '').trim()
  return { cleanContent, suggestions }
}

/**
 * Tách <question>...</question> — dùng để nhận dạng CLARIFICATION khi load từ DB.
 * Returns { cleanContent, isClarification }.
 */
export function parseAiQuestion(raw: string): { cleanContent: string; isClarification: boolean } {
  if (!raw) return { cleanContent: '', isClarification: false }
  const match = raw.match(/<question>(.*?)<\/question>/is)
  if (!match) return { cleanContent: raw.trim(), isClarification: false }
  return { cleanContent: match[1].trim(), isClarification: true }
}

/**
 * Remove AI control tags from display text.
 * - <question> keeps its inner text.
 * - <suggestions> section is removed from message body.
 */
export function stripAiControlTags(raw: string | undefined | null): string {
  if (!raw) return ''

  // Xóa các khối suggestions hoàn chỉnh
  let cleaned = raw.replace(/<suggestions>.*?<\/suggestions>/gis, '')
  // Xóa phần suggestions đang stream dở dang ở cuối
  cleaned = cleaned.replace(/<suggestions>.*$/is, '')
  
  // Xóa thẻ question
  const withQuestionContent = cleaned.replace(/<question>(.*?)<\/question>/gis, '$1')
  
  return withQuestionContent.trim()
}

export const AI_SUGGESTION_EVENT = 'bondhub-ai-suggestion-clicked'
