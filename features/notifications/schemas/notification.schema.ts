import { z } from 'zod'

export const NotificationGroupResponseSchema = z.object({
  id: z.string(),
  type: z.string(),
  referenceId: z.string().nullable(),
  title: z.string(),
  body: z.string(),
  actorIds: z.array(z.string()),
  actorCount: z.number(),
  read: z.boolean(),
  lastModifiedAt: z.string(),
  payload: z
    .record(z.string(), z.any())
    .nullable()
    .transform((v) => v ?? {})
    .default({})
})

export type NotificationGroupResponse = z.infer<typeof NotificationGroupResponseSchema>

export const NotificationHistoryResponseSchema = z.object({
  newest: z.array(NotificationGroupResponseSchema),
  today: z.array(NotificationGroupResponseSchema),
  previous: z.array(NotificationGroupResponseSchema),
  nextCursor: z.string().nullable()
})

export type NotificationHistoryResponse = z.infer<typeof NotificationHistoryResponseSchema>

export const NotificationFlatHistoryResponseSchema = z.object({
  items: z.array(NotificationGroupResponseSchema),
  nextCursor: z.string().nullable()
})

export type NotificationFlatHistoryResponse = z.infer<typeof NotificationFlatHistoryResponseSchema>

export const UserNotificationStateResponseSchema = z.object({
  unreadCount: z.number(),
  lastCheckedAt: z.string().nullable()
})

export type UserNotificationStateResponse = z.infer<typeof UserNotificationStateResponseSchema>
