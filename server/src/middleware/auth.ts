import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    const token = header.slice(7);
    req.user = authService.verifyToken(token);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

// Optional auth — attaches user if token present, but doesn't block
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (header?.startsWith('Bearer ')) {
    try {
      req.user = authService.verifyToken(header.slice(7));
    } catch {
      // Invalid token — continue as unauthenticated
    }
  }

  next();
}

// Session ID from header or cookie (for analytics)
export function attachSession(req: Request, _res: Response, next: NextFunction): void {
  req.sessionId =
    (req.headers['x-session-id'] as string) ??
    req.cookies?.sessionId ??
    `anon-${Date.now()}`;
  next();
}
