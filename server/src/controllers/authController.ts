import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import type { RegisterRequest, LoginRequest } from '@bmw-ai/shared';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body as RegisterRequest);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body as LoginRequest);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: req.user });
  },
};
