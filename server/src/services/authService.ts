import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { RegisterRequest, LoginRequest, AuthResponse } from '@bmw-ai/shared';
import { userRepository } from '../repositories/userRepository.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'bmw-ai-dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export class AuthService {
  async register(req: RegisterRequest): Promise<AuthResponse> {
    const exists = await userRepository.emailExists(req.email);
    if (exists) {
      throw new Error('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(req.password, 12);
    const user = await userRepository.create({
      email: req.email,
      passwordHash,
      firstName: req.firstName,
      lastName: req.lastName,
      phone: req.phone,
    });

    const token = this.signToken({ id: user.id, email: user.email, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async login(req: LoginRequest): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(req.email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const valid = await bcrypt.compare(req.password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password.');
    }

    const token = this.signToken({ id: user.id, email: user.email, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }

  private signToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  }
}

export const authService = new AuthService();
