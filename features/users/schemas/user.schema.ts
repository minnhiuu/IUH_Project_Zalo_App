import { z } from 'zod'
import { Gender } from '@/constants/enum'

export const userUpdateRequestSchema = z.object({
  fullName: z.string().min(1, 'user.update.fullNameRequired').optional(),
  dob: z
    .string()
    .refine(
      (date) => {
        if (!date) return true // Allow empty
        const selectedDate = new Date(date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return selectedDate <= today
      },
      { message: 'user.update.dobInvalid' }
    )
    .optional(),
  bio: z.string().optional(),
  gender: z.nativeEnum(Gender).optional()
})

export const profileEditSchema = z.object({
  fullName: z.string().min(1, 'user.update.fullNameRequired'),
  dob: z.string().refine(
    (date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate <= today
    },
    { message: 'user.update.dobInvalid' }
  ),
  gender: z.nativeEnum(Gender)
})

export const userProfileResponseSchema = z.object({
  id: z.string(),
  phoneNumber: z.string(),
  email: z.string(),
  fullName: z.string(),
  bio: z.string(),
  gender: z.nativeEnum(Gender),
  dob: z.string(), // ISO date string (LocalDate from backend)
  avatar: z.string().nullable(),
  background: z.string().nullable(),
  backgroundY: z.number().nullable()
})

export const accountResponseSchema = z.object({
  id: z.string(),
  phoneNumber: z.string(),
  email: z.string(),
  role: z.string()
})

export const userResponseSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  dob: z.string(), // ISO date string (LocalDate from backend)
  bio: z.string(),
  gender: z.nativeEnum(Gender),
  accountInfo: accountResponseSchema.nullable(),
  avatar: z.string().nullable(),
  background: z.string().nullable(),
  backgroundY: z.number().nullable()
})

export type UserUpdateRequest = z.infer<typeof userUpdateRequestSchema>
export type ProfileEditForm = z.infer<typeof profileEditSchema>
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>
export type AccountResponse = z.infer<typeof accountResponseSchema>
export type UserResponse = z.infer<typeof userResponseSchema>

export type UserSummaryResponse = {
  id: string
  fullName: string
  avatar: string | null
  phoneNumber?: string | null
}

export type UserImageResponse = {
  imageUrl: string
}
