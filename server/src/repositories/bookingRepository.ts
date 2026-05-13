import type { BookingConfirmation } from '@bmw-ai/shared';
import { prisma } from '../db/prisma.js';

export interface CreateBookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleId: string;
  dealerId: string;
  preferredDate: Date;
  notes?: string;
  userId?: string;
}

// In-memory store for demo mode (when DATABASE_URL is not set)
const memoryStore: Array<{ id: string; reference: string; data: CreateBookingData; createdAt: Date }> = [];

export class BookingRepository {
  private async dbAvailable(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async create(data: CreateBookingData): Promise<{ id: string; reference: string }> {
    // Fallback: store in memory when DB is unavailable
    if (!(await this.dbAvailable())) {
      const id = crypto.randomUUID();
      const reference = `BMW-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
      memoryStore.push({ id, reference, data, createdAt: new Date() });
      return { id, reference };
    }

    const booking = await prisma.testDriveBooking.create({
      data: {
        ...data,
        status: 'pending',
      },
    });

    // Reference: first 8 chars of ID uppercase — e.g. "BMW-A1B2C3D4"
    const reference = `BMW-${booking.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    return { id: booking.id, reference };
  }

  async findById(id: string) {
    return prisma.testDriveBooking.findUnique({
      where: { id },
      include: { vehicle: true, dealer: true, user: true },
    });
  }

  async findByEmail(email: string) {
    return prisma.testDriveBooking.findMany({
      where: { email },
      include: { vehicle: true, dealer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled') {
    return prisma.testDriveBooking.update({ where: { id }, data: { status } });
  }
}

export const bookingRepository = new BookingRepository();
