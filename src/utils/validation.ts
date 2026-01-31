import { z } from 'zod';
import { APP_CONFIG } from './constants';

// Signup validation schema
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .email('Invalid email address'),
  password: z
    .string()
    .min(APP_CONFIG.MIN_PASSWORD_LENGTH, `Password must be at least ${APP_CONFIG.MIN_PASSWORD_LENGTH} characters`),
  confirmPassword: z
    .string(),
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email address'),
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(APP_CONFIG.MIN_PASSWORD_LENGTH, `Password must be at least ${APP_CONFIG.MIN_PASSWORD_LENGTH} characters`),
  confirmPassword: z
    .string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Settings form validation schema (profile update)
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
});

// Password change validation schema
export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(APP_CONFIG.MIN_PASSWORD_LENGTH, `New password must be at least ${APP_CONFIG.MIN_PASSWORD_LENGTH} characters`),
  confirmNewPassword: z
    .string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

// Upload song validation schema
export const uploadSongSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  artist: z
    .string()
    .min(1, 'Artist is required')
    .max(200, 'Artist must be less than 200 characters'),
  audioFile: z
    .custom<FileList>((val) => val instanceof FileList && val.length > 0, 'Audio file is required')
    .refine(
      (files) => {
        if (!files || files.length === 0) return false;
        const file = files[0];
        const allowedExtensions = ['.mp3', '.wav', '.ogg', '.flac'];
        const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        return (APP_CONFIG.ALLOWED_AUDIO_TYPES as readonly string[]).includes(file.type) || hasValidExtension;
      },
      'Invalid audio format. Supported: MP3, WAV, OGG, FLAC'
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return false;
        const file = files[0];
        return file.size <= APP_CONFIG.MAX_FILE_SIZE;
      },
      `File size must be less than ${APP_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`
    ),
});

// Export types inferred from schemas
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type UploadSongFormData = z.infer<typeof uploadSongSchema>;
