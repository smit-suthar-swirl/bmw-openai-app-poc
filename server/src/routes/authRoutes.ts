import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validations/authSchema.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /api/auth/register
router.post('/register', authLimiter, validateBody(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);

// GET /api/auth/me — protected
router.get('/me', authenticate, authController.me);

export default router;
