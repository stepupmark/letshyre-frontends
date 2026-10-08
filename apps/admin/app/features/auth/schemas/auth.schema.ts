import { z } from "zod"

const newPassword = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "At least one uppercase letter")
  .regex(/[0-9]/, "At least one number")

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
})

export const requestOtpSchema = z.object({
  email: z.email("Enter a valid email"),
})

export const verifyOtpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
})

export const resetPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  })

export const loginResultSchema = z.looseObject({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
})

export const adminProfileSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string().nullish(),
  email: z.string().nullish(),
  phone_number: z.string().nullish(),
})

export const sendOtpResultSchema = z.object({
  otp_session_key: z.string().min(1),
  message: z.string().optional(),
})

export const statusResultSchema = z.object({
  status: z.boolean().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
})
