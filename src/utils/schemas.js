import { z } from 'zod';

const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

const nameSchema = z
  .string()
  .min(1, 'This field is required')
  .min(2, 'Must be at least 2 characters')
  .max(50, 'Must be 50 characters or less')
  .regex(/^[a-zA-Z\s'-]+$/, 'Only letters, spaces, hyphens and apostrophes allowed');

const pincodeSchema = z
  .string()
  .min(1, 'Pincode is required')
  .regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit pincode');

export const loginSchema = z.object({
  phoneNumber: phoneSchema,
});

export const registerSchema = z.object({
  phoneNumber: phoneSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  city: z.string().min(1, 'City is required').max(100, 'City name is too long'),
  pincode: pincodeSchema,
  isInternal: z.boolean().optional().default(false),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});
