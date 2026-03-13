// Date/Time utilities
import { format, formatDistanceToNow, isThisWeek, isToday, isYesterday, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

export const formatMessageTime = (dateString: string): string => {
  const date = parseISO(dateString)

  if (isToday(date)) {
    return format(date, 'HH:mm')
  }

  if (isYesterday(date)) {
    return 'Hôm qua'
  }

  if (isThisWeek(date)) {
    return format(date, 'EEEE', { locale: vi })
  }

  return format(date, 'dd/MM/yyyy')
}

export const formatChatTime = (dateString: string): string => {
  const date = parseISO(dateString)
  return format(date, 'HH:mm')
}

export const formatFullDate = (dateString: string): string => {
  const date = parseISO(dateString)
  return format(date, 'dd/MM/yyyy HH:mm')
}

export const formatRelativeTime = (dateString: string): string => {
  const date = parseISO(dateString)
  return formatDistanceToNow(date, { addSuffix: true, locale: vi })
}

export const formatBirthday = (dateString: string): string => {
  const date = parseISO(dateString)
  return format(date, 'dd/MM/yyyy')
}

export const getTimeAgo = (dateString: string): string => {
  const date = parseISO(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

  if (diffInMinutes < 1) return 'Vừa xong'
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} giờ trước`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} ngày trước`

  return formatFullDate(dateString)
}

export const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = parseISO(dateString)
  return format(date, 'dd/MM/yyyy')
}

export const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month, 0).getDate()
}

export const formatDisplayDate = (dateString: string): string => {
  if (!dateString) return ''
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy')
  } catch {
    return dateString
  }
}
