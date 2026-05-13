import { Router } from 'express';
import { dealerController } from '../controllers/dealerController.js';

const router = Router();

// GET /api/dealers?city=Dubai
router.get('/', dealerController.list);

// GET /api/dealers/:id
router.get('/:id', dealerController.getById);

export default router;
