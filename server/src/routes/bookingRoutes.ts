import { Router } from 'express';
import { bookingController } from '../controllers/bookingController.js';
import { validateBody } from '../middleware/validate.js';
import { bookingSchema } from '../validations/bookingSchema.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/test-drive — create a test drive booking
router.post(
  '/',
  bookingLimiter,
  optionalAuth,
  validateBody(bookingSchema),
  bookingController.create
);

// GET /api/test-drive?email=user@example.com — look up bookings
router.get('/', bookingController.myBookings);

export default router;
