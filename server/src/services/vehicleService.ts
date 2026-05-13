import type {
  BMWVehicle,
  SearchParams,
  SearchResult,
  ComparisonResult,
  PricingResult,
} from '@bmw-ai/shared';
import { vehicleRepository } from '../repositories/vehicleRepository.js';

export class VehicleService {
  async search(params: SearchParams): Promise<SearchResult> {
    // Normalise natural language → structured filters before hitting the DB
    const enriched = this.enrichSearchParams(params);

    const [vehicles, total] = await Promise.all([
      vehicleRepository.findAll(enriched),
      vehicleRepository.count(enriched),
    ]);

    const limit = params.limit ?? 20;
    const page = params.page ?? 1;

    return {
      vehicles,
      query: params.query ?? '',
      totalFound: total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Parses natural language tokens into structured filters.
  // After extracting structured filters, the raw query is cleared so Prisma
  // does not also run a full-text search that matches nothing (e.g. "Best BMW
  // SUV under $90k" won't appear literally in any vehicle name).
  private enrichSearchParams(params: SearchParams): SearchParams {
    const enriched = { ...params };
    const q = params.query?.toLowerCase() ?? '';

    if (!q) return enriched;

    let filtersExtracted = false;

    // Electric
    if (q.includes('electric') || q.match(/\bev\b/)) {
      enriched.isElectric = true;
      filtersExtracted = true;
    }

    // Body type
    if (q.includes('suv')) { enriched.type = 'SUV'; filtersExtracted = true; }
    else if (q.includes('sedan')) { enriched.type = 'Sedan'; filtersExtracted = true; }
    else if (q.includes('coupe')) { enriched.type = 'Coupe'; filtersExtracted = true; }

    // Price ceiling  e.g. "under $90k", "under 100000"
    const underMatch = q.match(/under\s+\$?([\d,.]+k?)/i);
    if (underMatch) {
      const raw = underMatch[1].replace(',', '').replace('k', '000');
      enriched.maxPrice = parseInt(raw, 10);
      filtersExtracted = true;
    }

    // Seating / family
    if (q.includes('7 seat') || q.includes('7-seat') || q.includes('family')) {
      enriched.minSeating = 6;
      filtersExtracted = true;
    }

    // Performance
    if (q.match(/\bfast\b|\bsport\b|\bperformance\b/)) {
      enriched.minHorsepower = 400;
      filtersExtracted = true;
    }

    // Once we have structured filters, clear the raw query so Prisma doesn't
    // also try to match the full sentence against vehicle names/descriptions.
    // Only keep the query for genuine model-name lookups (e.g. "BMW i4").
    if (filtersExtracted) {
      enriched.query = undefined;
    }

    return enriched;
  }

  async compare(modelNameA: string, modelNameB: string): Promise<ComparisonResult> {
    const [vehicleA, vehicleB] = await Promise.all([
      vehicleRepository.findByName(modelNameA),
      vehicleRepository.findByName(modelNameB),
    ]);

    if (!vehicleA) {
      throw new Error(`BMW model not found: "${modelNameA}". Try a name like "BMW M4", "i7", "X5".`);
    }
    if (!vehicleB) {
      throw new Error(`BMW model not found: "${modelNameB}". Try a name like "BMW i4", "XM", "X3".`);
    }

    return {
      vehicleA,
      vehicleB,
      winner: {
        price: vehicleA.price < vehicleB.price ? vehicleA.name : vehicleB.name,
        horsepower: vehicleA.horsepower > vehicleB.horsepower ? vehicleA.name : vehicleB.name,
        acceleration: vehicleA.acceleration < vehicleB.acceleration ? vehicleA.name : vehicleB.name,
        range:
          vehicleA.range !== null && vehicleB.range !== null
            ? vehicleA.range > vehicleB.range
              ? vehicleA.name
              : vehicleB.name
            : null,
        seating: vehicleA.seating >= vehicleB.seating ? vehicleA.name : vehicleB.name,
      },
    };
  }

  async getPricing(modelName: string): Promise<PricingResult> {
    const vehicle = await vehicleRepository.findByName(modelName);

    if (!vehicle) {
      throw new Error(
        `BMW model not found: "${modelName}". Try "BMW X5", "i7", "M4 Competition", "i4".`
      );
    }

    const pricePerHp = vehicle.price / vehicle.horsepower;

    return {
      vehicle,
      formattedPrice: `$${vehicle.price.toLocaleString('en-US')}`,
      pricePerHorsepower: `$${Math.round(pricePerHp).toLocaleString('en-US')}/hp`,
      category: this.getPriceCategory(vehicle.price),
    };
  }

  async getAllVehicles(): Promise<BMWVehicle[]> {
    return vehicleRepository.findAll();
  }

  private getPriceCategory(price: number): string {
    if (price < 55000) return 'Entry Luxury';
    if (price < 80000) return 'Mid Luxury';
    if (price < 120000) return 'Premium Luxury';
    return 'Ultra Luxury';
  }
}

export const vehicleService = new VehicleService();
