import { parseMessageDate } from '@/features/message/utils/date-utils'

const MS_PER_DAY = 24 * 60 * 60 * 1000

const getStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const formatSearchTime = (value: string | number | Date | null | undefined) => {
  const date = parseMessageDate(value)
  if (!date) return ''

  const now = new Date()
  const today = getStartOfDay(now)
  const targetDay = getStartOfDay(date)
  const dayDiff = Math.floor((today.getTime() - targetDay.getTime()) / MS_PER_DAY)

  if (dayDiff <= 0) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  if (dayDiff === 1) return 'Yesterday'
  if (dayDiff < 7) return `${dayDiff} ngày trước`
  if (dayDiff < 30) return `${Math.floor(dayDiff / 7)} tuần trước`
  if (dayDiff <= 31) return '1 tháng trước'

  const dateOptions: Intl.DateTimeFormatOptions =
    dayDiff >= 365 ? { day: '2-digit', month: '2-digit', year: 'numeric' } : { day: '2-digit', month: '2-digit' }

  return date.toLocaleDateString('vi-VN', dateOptions)
}
