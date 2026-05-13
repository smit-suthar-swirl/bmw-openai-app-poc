import { analyticsRepository } from '../repositories/analyticsRepository.js';

type AnalyticsEvent =
  | 'vehicle_search'
  | 'vehicle_compare'
  | 'vehicle_pricing'
  | 'dealer_search'
  | 'test_drive_booking';

interface TrackOptions {
  userId?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
}

export class AnalyticsService {
  private posthogClient: { capture: (data: unknown) => void } | null = null;

  constructor() {
    // Initialize PostHog if the API key is configured
    const apiKey = process.env.POSTHOG_API_KEY;
    if (apiKey) {
      // Lazy import to avoid hard dependency when key isn't set
      import('posthog-node')
        .then(({ PostHog }) => {
          this.posthogClient = new PostHog(apiKey, {
            host: process.env.POSTHOG_HOST ?? 'https://app.posthog.com',
          });
          console.log('PostHog analytics initialized');
        })
        .catch(() => {
          // PostHog not installed — silently fall back to DB-only tracking
        });
    }
  }

  async track(event: AnalyticsEvent, options: TrackOptions = {}): Promise<void> {
    const properties = { ...options.properties, timestamp: new Date().toISOString() };

    // Track in DB (never throws)
    await analyticsRepository.track({
      event,
      properties,
      userId: options.userId,
      sessionId: options.sessionId,
    });

    // Also push to PostHog if available
    if (this.posthogClient) {
      this.posthogClient.capture({
        distinctId: options.userId ?? options.sessionId ?? 'anonymous',
        event,
        properties,
      });
    }
  }

  async trackSearch(query: string, resultCount: number, opts?: TrackOptions) {
    return this.track('vehicle_search', {
      ...opts,
      properties: { query, resultCount, ...(opts?.properties ?? {}) },
    });
  }

  async trackCompare(modelA: string, modelB: string, opts?: TrackOptions) {
    return this.track('vehicle_compare', {
      ...opts,
      properties: { modelA, modelB, ...(opts?.properties ?? {}) },
    });
  }

  async trackPricing(model: string, opts?: TrackOptions) {
    return this.track('vehicle_pricing', {
      ...opts,
      properties: { model, ...(opts?.properties ?? {}) },
    });
  }

  async trackDealerSearch(city: string, resultCount: number, opts?: TrackOptions) {
    return this.track('dealer_search', {
      ...opts,
      properties: { city, resultCount, ...(opts?.properties ?? {}) },
    });
  }

  async trackBooking(vehicleName: string, city: string, opts?: TrackOptions) {
    return this.track('test_drive_booking', {
      ...opts,
      properties: { vehicleName, city, ...(opts?.properties ?? {}) },
    });
  }
}

export const analyticsService = new AnalyticsService();
