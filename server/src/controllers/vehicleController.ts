import type { Request, Response, NextFunction } from 'express';
import { vehicleService } from '../services/vehicleService.js';
import { analyticsService } from '../services/analyticsService.js';
import { recommendService } from '../recommendations/recommendService.js';
import type { SearchParams, RecommendParams } from '@bmw-ai/shared';

export const vehicleController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = req.query as unknown as SearchParams;
      const result = await vehicleService.search(params);
      res.json({ success: true, data: result.vehicles, pagination: { total: result.totalFound } });
    } catch (err) {
      next(err);
    }
  },

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = req.body as SearchParams;
      const result = await vehicleService.search(params);

      // Fire-and-forget analytics
      analyticsService.trackSearch(params.query ?? '', result.totalFound, {
        userId: req.user?.id,
        sessionId: req.sessionId,
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async compare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { modelA, modelB } = req.body as { modelA: string; modelB: string };
      const result = await vehicleService.compare(modelA, modelB);

      analyticsService.trackCompare(modelA, modelB, {
        userId: req.user?.id,
        sessionId: req.sessionId,
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async pricing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { model } = req.body as { model: string };
      const result = await vehicleService.getPricing(model);

      analyticsService.trackPricing(model, {
        userId: req.user?.id,
        sessionId: req.sessionId,
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async recommend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = req.body as RecommendParams;
      const result = await recommendService.recommend(params);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
};
