import { Platform } from '@/constants'
import z from 'zod'

export const deviceTokenRequestSchema = z.object({
  token: z.string(),
  platform: z.enum([Platform.Web, Platform.Android, Platform.iOS])
})

export type DeviceTokenRequest = z.infer<typeof deviceTokenRequestSchema>
