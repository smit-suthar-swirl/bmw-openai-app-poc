import type { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/bookingService.js';
import { analyticsService } from '../services/analyticsService.js';
import type { BookingRequest } from '@bmw-ai/shared';

export const bookingController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingReq: BookingRequest = {
        ...req.body,
        userId: req.user?.id,
      };

      const confirmation = await bookingService.create(bookingReq);

      analyticsService.trackBooking(bookingReq.vehicleName, bookingReq.dealerCity, {
        userId: req.user?.id,
        sessionId: req.sessionId,
      });

      res.status(201).json({ success: true, data: confirmation });
    } catch (err) {
      next(err);
    }
  },

  async myBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.query as { email?: string };
      if (!email) {
        res.status(400).json({ success: false, error: 'email query parameter is required' });
        return;
      }
      const bookings = await bookingService.getByEmail(email);
      res.json({ success: true, data: bookings });
    } catch (err) {
      next(err);
    }
  },
};
