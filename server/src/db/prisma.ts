import { PrismaClient } from '@prisma/client';

// Singleton pattern — prevents multiple Prisma instances during hot-reload in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Suppress Prisma schema validation noise when DATABASE_URL is not configured
const logLevel = process.env.DATABASE_URL && process.env.NODE_ENV === 'development'
  ? ['error', 'warn'] as const
  : [] as const;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: logLevel });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDB(): Promise<boolean> {
  try {
    await prisma.$connect();
    return true;
  } catch {
    return false;
  }
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
}
