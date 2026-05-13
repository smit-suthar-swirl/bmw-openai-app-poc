import { z } from 'zod';

export const searchSchema = z.object({
  query: z.string().max(200).optional(),
  type: z.enum(['SUV', 'Sedan', 'Coupe', 'EV', 'Sports']).optional(),
  maxPrice: z.coerce.number().positive().optional(),
  minPrice: z.coerce.number().positive().optional(),
  isElectric: z.coerce.boolean().optional(),
  minHorsepower: z.coerce.number().positive().optional(),
  minSeating: z.coerce.number().min(2).max(9).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const dealerSearchSchema = z.object({
  city: z.string().max(100).optional(),
  query: z.string().max(100).optional(),
});
