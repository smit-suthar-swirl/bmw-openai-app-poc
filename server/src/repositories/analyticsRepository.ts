import { prisma } from '../db/prisma.js';

export interface CreateEventData {
  event: string;
  properties: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

export class AnalyticsRepository {
  async track(data: CreateEventData): Promise<void> {
    try {
      await prisma.analyticsEvent.create({ data });
    } catch {
      // Never let analytics failures break the main request
    }
  }

  async getEventCounts(since?: Date) {
    return prisma.analyticsEvent.groupBy({
      by: ['event'],
      _count: { event: true },
      where: since ? { createdAt: { gte: since } } : undefined,
      orderBy: { _count: { event: 'desc' } },
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();
