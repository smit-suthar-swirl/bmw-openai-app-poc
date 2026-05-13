import { Router } from 'express';
import { vehicleController } from '../controllers/vehicleController.js';
import { validateBody } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

// GET /api/vehicles — list all with optional query filters
router.get('/', vehicleController.list);

// POST /api/vehicles/search — structured search
router.post('/search', vehicleController.search);

// POST /api/vehicles/compare
router.post(
  '/compare',
  validateBody(z.object({ modelA: z.string().min(1), modelB: z.string().min(1) })),
  vehicleController.compare
);

// POST /api/vehicles/pricing
router.post(
  '/pricing',
  validateBody(z.object({ model: z.string().min(1) })),
  vehicleController.pricing
);

// POST /api/vehicles/recommend
router.post('/recommend', vehicleController.recommend);

// Legacy Phase 1 routes (kept for backward compatibility)
router.post('/search-legacy', vehicleController.search);

export default router;
