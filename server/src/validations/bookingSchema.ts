import { z } from 'zod';

export const bookingSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{8,20}$/, 'Invalid phone number format'),
  vehicleName: z.string().min(2, 'Vehicle name is required'),
  dealerCity: z.enum(['Dubai', 'Abu Dhabi', 'Sharjah'], {
    errorMap: () => ({ message: 'City must be Dubai, Abu Dhabi, or Sharjah' }),
  }),
  preferredDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), 'Invalid date format')
    .refine((d) => new Date(d) > new Date(), 'Date must be in the future'),
  notes: z.string().max(500).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
