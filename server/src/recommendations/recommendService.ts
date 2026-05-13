import type { RecommendParams, RecommendationResult } from '@bmw-ai/shared';
import { vehicleRepository } from '../repositories/vehicleRepository.js';
import { inventoryService } from '../services/inventoryService.js';
import { rankVehicles } from './recommendationEngine.js';
import { cacheService } from '../cache/cacheService.js';

export class RecommendService {
  async recommend(params: RecommendParams): Promise<RecommendationResult> {
    const cacheKey = `recommend:${JSON.stringify(params)}`;

    return cacheService.wrap(cacheKey, async () => {
      const all = await vehicleRepository.findAll();
      const ranked = rankVehicles(all, params);

      if (ranked.length === 0) {
        throw new Error('No vehicles match your criteria. Try adjusting your budget or preferences.');
      }

      const [top, ...rest] = ranked;
      const alternatives = rest.slice(0, 3).map((r) => r.vehicle);

      const inventory = params.city
        ? await inventoryService.getForVehicleInCity(top.vehicle.id, params.city)
        : await inventoryService.getForVehicle(top.vehicle.id);

      return {
        topPick: top.vehicle,
        alternatives,
        reasoning: top.reasons.length > 0 ? top.reasons : ['Best overall match for your needs'],
        matchScore: top.score,
        inventory,
      };
    }, 120);
  }
}

export const recommendService = new RecommendService();
