import { z } from "zod";
import { Gender } from "@/constants/enum";

/**
 * Request Schemas (Zod for validation)
 */

export const userUpdateRequestSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống").optional(),
  dob: z.string().optional(), // ISO date string
  bio: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
});

/**
 * Request Types (inferred from Zod schemas)
 */

export type UserUpdateRequest = z.infer<typeof userUpdateRequestSchema>;

/**
 * Response Types (TypeScript interfaces for API responses)
 */

export type AccountResponse = {
  id: string;
  phoneNumber: string;
  email: string;
  role: string;
};

export type UserResponse = {
  id: string;
  fullName: string;
  dob: string; // ISO date string (LocalDate from backend)
  bio: string;
  gender: Gender;
  accountInfo: AccountResponse;
};
