import { z } from 'zod'
import { Gender } from '@/constants/enum'

export const userUpdateRequestSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống').optional(),
  dob: z.string().optional(), // ISO date string
  bio: z.string().optional(),
  gender: z.nativeEnum(Gender).optional()
})

export type UserUpdateRequest = z.infer<typeof userUpdateRequestSchema>

export type UserResponse = {
  id: string
  phoneNumber: string
  email: string
  fullName: string
  bio: string
  gender: Gender
  dob: string // ISO date string (LocalDate from backend)
  avatar: string | null
  background: string | null
  backgroundY: number | null
}

export type UserSummaryResponse = {
  id: string
  fullName: string
  avatar: string | null
}

export type UserImageResponse = {
  imageUrl: string
}
