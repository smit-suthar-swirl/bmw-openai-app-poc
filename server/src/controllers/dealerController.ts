import type { Request, Response, NextFunction } from 'express';
import { dealerService } from '../services/dealerService.js';
import { analyticsService } from '../services/analyticsService.js';

export const dealerController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { city, query } = req.query as { city?: string; query?: string };
      const result = await dealerService.search({ city, query });

      analyticsService.trackDealerSearch(city ?? query ?? 'all', result.totalFound, {
        userId: req.user?.id,
        sessionId: req.sessionId,
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dealer = await dealerService.getById(req.params.id);
      if (!dealer) {
        res.status(404).json({ success: false, error: 'Dealer not found' });
        return;
      }
      res.json({ success: true, data: dealer });
    } catch (err) {
      next(err);
    }
  },
};
